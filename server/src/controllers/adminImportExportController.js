const Question = require('../models/Question');
const AuditLog = require('../models/AuditLog');
const { parseCSV, parseXLSX, parsePDFDeterministic } = require('../utils/importExportUtils');
const { stringify } = require('csv-stringify/sync');

// Validate row and check database duplicates
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

  if (existingMap.has(normalizedText)) {
    errors.push('Already exists in database');
  }

  return {
    ...row,
    isValid: errors.length === 0,
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
    // To do this efficiently in MongoDB without regex on large arrays:
    const regexQueries = incomingTexts.map(t => ({ text: new RegExp('^' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }));
    let existingQuestions = [];
    if (regexQueries.length > 0) {
      existingQuestions = await Question.find({ $or: regexQueries }).select('text').lean();
    }

    const existingMap = new Set(existingQuestions.map(q => q.text.toLowerCase()));
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
      existingQuestions = await Question.find({ $or: regexQueries }).select('text').lean();
    }

    const existingMap = new Set(existingQuestions.map(q => q.text.toLowerCase()));
    const localSet = new Set();
    const validQuestionsToInsert = [];

    for (const row of questions) {
      const validated = await validateAndCheckRow(row, existingMap, localSet);
      if (validated.isValid) {
        // Enforce safe fields and default DRAFT status
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
          createdBy: req.user._id,
          updatedBy: req.user._id
        });
      }
    }

    if (validQuestionsToInsert.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid questions to insert after server-side validation' });
    }

    const inserted = await Question.insertMany(validQuestionsToInsert, { ordered: false });

    await AuditLog.create({
      admin: req.user._id,
      action: 'BULK_IMPORT_QUESTIONS',
      entityType: 'Question',
      entityId: null, // Bulk
      metadata: { count: inserted.length }
    });

    res.json({
      success: true,
      message: `Successfully imported ${inserted.length} questions as DRAFT.`,
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
