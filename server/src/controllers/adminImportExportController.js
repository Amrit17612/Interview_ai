const mongoose = require('mongoose');
const Question = require('../models/Question');
const AuditLog = require('../models/AuditLog');
const { parseCSV, parseXLSX, parsePDFDeterministic } = require('../utils/importExportUtils');
const { stringify } = require('csv-stringify/sync');

const validateAndCheckRow = async (row, existingMap, localSet) => {
  const errors = [];
  
  if (!row.text || row.text.trim().length === 0) {
    errors.push('Text is required');
  }
  if (!['TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'GENERAL'].includes(row.type)) {
    errors.push('Invalid type');
  }
  if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(row.difficulty)) {
    errors.push('Invalid difficulty');
  }

  const normalizedText = row.text ? row.text.trim().toLowerCase() : '';

  if (localSet.has(normalizedText)) {
    errors.push('Duplicate in current upload');
  } else if (normalizedText) {
    localSet.add(normalizedText);
  }

  let isExisting = false;
  let existingId = null;
  let newFollowUpsToAdd = [];

  if (existingMap.has(normalizedText)) {
    isExisting = true;
    const existingDoc = existingMap.get(normalizedText);
    existingId = existingDoc._id;
    
    // Check if there are new follow-ups to add
    if (row.parsedFollowUps && row.parsedFollowUps.length > 0) {
      const existingFUTs = new Set();
      const addFUTs = (fus) => {
        if (Array.isArray(fus)) {
          fus.forEach(fu => { if (fu.text) existingFUTs.add(fu.text.toLowerCase().trim()) });
        }
      };
      if (existingDoc.followUps) {
        addFUTs(existingDoc.followUps.neutral);
        addFUTs(existingDoc.followUps.weak);
        addFUTs(existingDoc.followUps.strong);
      }
      
      newFollowUpsToAdd = row.parsedFollowUps.filter(fuText => !existingFUTs.has(fuText.toLowerCase().trim()));
    }

    if (newFollowUpsToAdd.length === 0) {
      errors.push('Already exists in database with no new follow-ups');
    }
  }

  return {
    ...row,
    isValid: errors.length === 0,
    isExisting,
    existingId,
    newFollowUpsToAdd,
    errors
  };
};

/**
 * Preview file import (Parse, Validate, but NO DB insert)
 * @route POST /api/admin/questions/import/preview
 */
const previewImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { mimetype, originalname, buffer } = req.file;
    let rawRows = [];

    if (mimetype === 'text/csv' || originalname.endsWith('.csv')) {
      rawRows = await parseCSV(buffer);
    } else if (mimetype.includes('spreadsheetml') || originalname.endsWith('.xlsx')) {
      rawRows = await parseXLSX(buffer);
    } else if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      rawRows = await parsePDFDeterministic(buffer);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type' });
    }

    if (rawRows.length > 500) {
      return res.status(400).json({ success: false, message: 'Maximum 500 rows allowed per upload' });
    }

    // Build map of existing questions to check duplicates efficiently
    // Doing a case-insensitive check by pulling all texts is fine for small DBs,
    // but for scaling, we pull texts of incoming rows and do an $in query with regex.
    const incomingTexts = rawRows.map(r => r.text?.trim() || '').filter(Boolean);
    
    // We fetch existing questions that match the incoming text (case-insensitive)
    const regexQueries = incomingTexts.map(t => ({ text: new RegExp('^' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }));
    let existingQuestions = [];
    if (regexQueries.length > 0) {
      existingQuestions = await Question.find({ $or: regexQueries })
        .populate('followUps.neutral', 'text')
        .populate('followUps.weak', 'text')
        .populate('followUps.strong', 'text')
        .lean();
    }

    const existingMap = new Map();
    existingQuestions.forEach(q => existingMap.set(q.text.toLowerCase().trim(), q));
    const localSet = new Set();

    const processedRows = [];
    for (const row of rawRows) {
      const processed = await validateAndCheckRow(row, existingMap, localSet);
      processedRows.push(processed);
    }

    res.json({
      success: true,
      data: {
        total: processedRows.length,
        validCount: processedRows.filter(r => r.isValid).length,
        errorCount: processedRows.filter(r => !r.isValid).length,
        rows: processedRows
      }
    });

  } catch (error) {
    console.error('Import preview error:', error);
    res.status(500).json({ success: false, message: 'Failed to process file: ' + error.message });
  }
};

/**
 * Confirm import (Insert valid rows to DB)
 * @route POST /api/admin/questions/import/confirm
 */
const confirmImport = async (req, res, next) => {
  try {
    const { questions } = req.body; // Array of question objects from frontend

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'No questions provided for import' });
    }

    if (questions.length > 500) {
      return res.status(400).json({ success: false, message: 'Maximum 500 rows allowed per import' });
    }

    // Server-side revalidation is critical. Do not trust frontend.
    const incomingTexts = questions.map(r => r.text?.trim() || '').filter(Boolean);
    const regexQueries = incomingTexts.map(t => ({ text: new RegExp('^' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }));
    let existingQuestions = [];
    if (regexQueries.length > 0) {
      existingQuestions = await Question.find({ $or: regexQueries })
        .populate('followUps.neutral', 'text')
        .populate('followUps.weak', 'text')
        .populate('followUps.strong', 'text')
        .lean();
    }

    const existingMap = new Map();
    existingQuestions.forEach(q => existingMap.set(q.text.toLowerCase().trim(), q));
    const localSet = new Set();
    const validQuestionsToInsert = [];
    const followUpsMap = new Map();
    const questionsToUpdate = [];

    for (const row of questions) {
      const validated = await validateAndCheckRow(row, existingMap, localSet);
      if (validated.isValid) {
        if (validated.isExisting) {
          questionsToUpdate.push({
            existingId: validated.existingId,
            mainQ: existingMap.get(row.text.toLowerCase().trim()),
            newFollowUpsToAdd: validated.newFollowUpsToAdd || []
          });
        } else {
          validQuestionsToInsert.push({
            text: validated.text,
            description: validated.description,
            type: validated.type,
            difficulty: validated.difficulty,
            companies: validated.companies || [],
            domains: validated.domains || [],
            roles: validated.roles || [],
            expectedPoints: validated.expectedPoints || [],
            tags: validated.tags || [],
            status: 'DRAFT',
            category: 'primary',
            createdBy: req.user._id,
            updatedBy: req.user._id
          });
          followUpsMap.set(validQuestionsToInsert.length - 1, validated.parsedFollowUps || []);
        }
      }
    }

    if (validQuestionsToInsert.length === 0 && questionsToUpdate.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid questions to insert or update after server-side validation' });
    }

    let inserted = [];
    let totalFollowUps = 0;
    let updatedCount = 0;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        if (validQuestionsToInsert.length > 0) {
          inserted = await Question.insertMany(validQuestionsToInsert, { ordered: true, session });
        }
        
        for (let i = 0; i < inserted.length; i++) {
          const mainQ = inserted[i];
          const fus = followUpsMap.get(i);
          if (fus && fus.length > 0) {
            const fuDocs = fus.map(fuText => ({
              text: fuText,
              type: mainQ.type,
              difficulty: mainQ.difficulty,
              domains: mainQ.domains,
              status: 'DRAFT',
              category: 'follow-up',
              createdBy: req.user._id,
              updatedBy: req.user._id
            }));
            
            const insertedFus = await Question.insertMany(fuDocs, { ordered: false, session });
            await Question.findByIdAndUpdate(mainQ._id, {
              $push: { 'followUps.neutral': { $each: insertedFus.map(f => f._id) } }
            }, { session });
            totalFollowUps += insertedFus.length;
          }
        }

        for (const update of questionsToUpdate) {
          const { existingId, mainQ, newFollowUpsToAdd } = update;
          if (newFollowUpsToAdd.length > 0) {
            const fuDocs = newFollowUpsToAdd.map(fuText => ({
              text: fuText,
              type: mainQ.type,
              difficulty: mainQ.difficulty,
              domains: mainQ.domains,
              status: 'DRAFT',
              category: 'follow-up',
              createdBy: req.user._id,
              updatedBy: req.user._id
            }));
            
            const insertedFus = await Question.insertMany(fuDocs, { ordered: false, session });
            await Question.findByIdAndUpdate(existingId, {
              $push: { 'followUps.neutral': { $each: insertedFus.map(f => f._id) } }
            }, { session });
            totalFollowUps += insertedFus.length;
            updatedCount++;
          }
        }

        const auditDocs = [{
          admin: req.user._id,
          action: 'BULK_IMPORT_QUESTIONS',
          entityType: 'Question',
          entityId: 'BULK', // Fixed from null
          metadata: { count: inserted.length, updatedCount, followUpCount: totalFollowUps }
        }];
        await AuditLog.create(auditDocs, { session });
      });
    } finally {
      await session.endSession();
    }

    res.json({
      success: true,
      message: `Successfully imported ${inserted.length} new questions, updated ${updatedCount} existing questions, and added ${totalFollowUps} follow-ups.`,
      data: inserted
    });

  } catch (error) {
    console.error('Import confirm error:', error);
    next(error);
  }
};

/**
 * Export Questions
 * @route GET /api/admin/questions/export
 */
const exportQuestions = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;

    const questions = await Question.find({})
      .select('text description type difficulty companies domains roles expectedPoints tags status followUps createdAt')
      .lean();

    await AuditLog.create({
      admin: req.user._id,
      action: 'EXPORT_QUESTIONS',
      entityType: 'Question',
      entityId: null,
      metadata: { format, count: questions.length }
    });

    if (format === 'csv') {
      const csvData = questions.map(q => ({
        text: q.text,
        description: q.description || '',
        type: q.type,
        difficulty: q.difficulty,
        companies: (q.companies || []).join('|'),
        domains: (q.domains || []).join('|'),
        roles: (q.roles || []).join('|'),
        expectedPoints: (q.expectedPoints || []).join('|'),
        tags: (q.tags || []).join('|'),
        status: q.status
        // Follow-ups explicitly omitted from CSV to avoid relational confusion
      }));

      const csvString = stringify(csvData, { header: true });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=questions_export.csv');
      return res.send(csvString);
    }

    // Default to JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=questions_export.json');
    return res.json(questions);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  previewImport,
  confirmImport,
  exportQuestions
};
