const mongoose = require('mongoose');
const fs = require('fs');
const Resume = require('../models/Resume');
const parsingService = require('../services/parsingService');

// Utility to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc    Upload a new resume
 * @route   POST /api/resumes
 * @access  Private
 */
const createResume = async (req, res, next) => {
  try {
    // req.file is populated by uploadMiddleware
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a valid PDF or DOCX file.');
    }

    const { originalname, filename, mimetype, size, path: storagePath } = req.file;

    let resume = await Resume.create({
      userId: req.user._id,
      originalFileName: originalname,
      storedFileName: filename,
      fileType: mimetype,
      fileSize: size,
      storagePath: storagePath,
      parsingStatus: 'PROCESSING'
    });

    try {
      // Synchronous parsing
      const parsedText = await parsingService.parseResume(storagePath, mimetype);
      resume.parsedText = parsedText;
      resume.parsingStatus = 'COMPLETED';
      await resume.save();
    } catch (parseError) {
      console.error(`[RESUME PARSING ERROR] Failed to parse resume ${resume._id}:`, parseError.message);
      resume.parsingStatus = 'FAILED';
      await resume.save();
    }

    res.status(201).json({
      success: true,
      resume: {
        id: resume._id,
        originalFileName: resume.originalFileName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        parsingStatus: resume.parsingStatus,
        createdAt: resume.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all resumes for the authenticated user
 * @route   GET /api/resumes
 * @access  Private
 */
const getResumes = async (req, res, next) => {
  try {
    // Strictly filter by authenticated user
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const safeResumes = resumes.map(r => ({
      id: r._id,
      originalFileName: r.originalFileName,
      fileType: r.fileType,
      fileSize: r.fileSize,
      parsingStatus: r.parsingStatus,
      analysisStatus: r.analysisStatus,
      createdAt: r.createdAt
    }));

    res.json({
      success: true,
      count: safeResumes.length,
      resumes: safeResumes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get specific resume metadata
 * @route   GET /api/resumes/:id
 * @access  Private
 */
const getResumeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error('Invalid resume ID format.');
    }

    const resume = await Resume.findOne({
      _id: id,
      userId: req.user._id // Strict ownership isolation
    });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found.');
    }

    res.json({
      success: true,
      resume: {
        id: resume._id,
        originalFileName: resume.originalFileName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        parsingStatus: resume.parsingStatus,
        parsedText: resume.parsedText,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const JobDescription = require('../models/JobDescription');
const analysisEngine = require('../services/analysisEngine');

/**
 * @desc    Delete a resume
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error('Invalid resume ID format.');
    }

    const resume = await Resume.findOne({
      _id: id,
      userId: req.user._id // Strict ownership isolation
    });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found.');
    }

    // Attempt to delete physical file first
    try {
      // Use the stored server-side path directly from DB
      if (fs.existsSync(resume.storagePath)) {
        fs.unlinkSync(resume.storagePath);
      }
    } catch (fsError) {
      console.error(`[FS ERROR] Failed to delete file: ${resume.storagePath}`, fsError);
      // We log but continue to delete the DB record so the user isn't stuck
    }

    // Delete DB record
    await resume.deleteOne();

    res.json({
      success: true,
      message: 'Resume deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start asynchronous resume analysis
 * @route   POST /api/resumes/:id/analyze
 * @access  Private
 */
const analyzeResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jobId } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error('Invalid resume ID format.');
    }

    const resume = await Resume.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found.');
    }

    if (resume.parsingStatus !== 'COMPLETED' || !resume.parsedText) {
      res.status(400);
      throw new Error('Cannot analyze a resume that has not been successfully parsed.');
    }

    if (resume.analysisStatus === 'PROCESSING') {
      res.status(400);
      throw new Error('Resume is already being analyzed.');
    }

    let jdDoc = null;
    if (jobId) {
      if (!isValidObjectId(jobId)) {
        res.status(400);
        throw new Error('Invalid Job Description ID format.');
      }
      jdDoc = await JobDescription.findOne({
        _id: jobId,
        userId: req.user._id
      });
      if (!jdDoc) {
        res.status(404);
        throw new Error('Job Description not found.');
      }
    }

    // Set to processing and reset stage
    resume.analysisStatus = 'PROCESSING';
    resume.analysisStage = 'IDLE';
    await resume.save();

    // Start background task
    analysisEngine.runAsyncAnalysis(resume, jdDoc).catch(err => {
      console.error('Unhandled background analysis error:', err);
    });

    res.status(202).json({
      success: true,
      message: 'Analysis started in the background.',
      analysisStatus: resume.analysisStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get resume analysis results
 * @route   GET /api/resumes/:id/analysis
 * @access  Private
 */
const getResumeAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error('Invalid resume ID format.');
    }

    const resume = await Resume.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found.');
    }

    res.json({
      success: true,
      analysis: {
        analysisStatus: resume.analysisStatus,
        analysisStage: resume.analysisStage || 'IDLE',
        lastAnalyzedAt: resume.lastAnalyzedAt,
        analyzedJobId: resume.analyzedJobId,
        structuredData: resume.structuredData,
        atsScore: resume.atsScore,
        qualityScore: resume.qualityScore,
        atsBreakdown: resume.atsBreakdown,
        contentAnalysis: resume.contentAnalysis,
        consistencyIssues: resume.consistencyIssues,
        formattingIssues: resume.formattingIssues,
        jdAnalysis: resume.jdAnalysis
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResume,
  getResumes,
  getResumeById,
  deleteResume,
  analyzeResume,
  getResumeAnalysis
};
