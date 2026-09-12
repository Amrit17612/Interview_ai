const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

const SAFARI_GENERIC_MIME_TYPES = ['application/octet-stream', ''];

const createUploadMiddleware = (options = {}) => {
  const allowedExtensions = options.allowedExtensions || [];
  const allowedMimeTypes = options.allowedMimeTypes || [];
  const fieldName = options.fieldName || 'file';
  const maxFileSize = options.maxFileSize || 5 * 1024 * 1024;
  const allowSafariGeneric = options.allowSafariGeneric !== undefined ? options.allowSafariGeneric : false;
  
  const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isValidMime = allowedMimeTypes.includes(file.mimetype);
    const isGenericMime = allowSafariGeneric && SAFARI_GENERIC_MIME_TYPES.includes(file.mimetype);
    const isValidExtension = allowedExtensions.includes(extension);

    if (!isValidExtension) {
      return cb(new Error(`Invalid file extension. Only ${allowedExtensions.join(', ')} are allowed.`), false);
    }

    if (!isValidMime && !isGenericMime) {
      return cb(new Error('Invalid file type.'), false);
    }

    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize
    }
  });

  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400);
          return next(new Error(`File is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`));
        }
        res.status(400);
        return next(new Error(`Upload error: ${err.message}`));
      } else if (err) {
        res.status(400);
        return next(new Error(err.message));
      }
      next();
    });
  };
};

// Existing handleUpload for backward compatibility
const handleUpload = createUploadMiddleware({
  allowedExtensions: ['.pdf', '.docx'],
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  fieldName: 'resume',
  maxFileSize: 5 * 1024 * 1024,
  allowSafariGeneric: true
});

const supportImageUpload = createUploadMiddleware({
  allowedExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.docx'],
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  fieldName: 'attachment',
  maxFileSize: 5 * 1024 * 1024,
  allowSafariGeneric: true
});

module.exports = {
  handleUpload,
  supportImageUpload,
  createUploadMiddleware
};
