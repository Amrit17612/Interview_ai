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

module.exports = {
  createResume,
  getResumes,
  getResumeById,
  deleteResume
};
