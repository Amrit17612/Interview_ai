const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a safe, random filename (prevent path traversal and collision)
    const randomName = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomName}${extension}`);
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
  }
  
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return cb(new Error('Invalid file extension. Only .pdf and .docx are allowed.'), false);
  }

  cb(null, true);
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB maximum file size
  }
});

// Error handling wrapper for multer
const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('resume'); // Expect 'resume' field name

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors (e.g., file too large)
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400);
        return next(new Error('File is too large. Maximum size is 5MB.'));
      }
      res.status(400);
      return next(new Error(`Upload error: ${err.message}`));
    } else if (err) {
      // Other errors (e.g., invalid file type from fileFilter)
      res.status(400);
      return next(new Error(err.message));
    }
    // No error
    next();
  });
};

module.exports = {
  handleUpload
};
