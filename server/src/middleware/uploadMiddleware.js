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

// Safari on macOS/iOS frequently sends 'application/octet-stream' or an empty
// string ('') instead of the correct PDF/DOCX MIME type, especially when
// uploading from iCloud Drive or Files.app. We accept those generic MIMEs
// only when the filename extension is explicitly .pdf or .docx.
// This does NOT globally whitelist 'application/octet-stream'—the extension
// gate ensures only document files are allowed through. Downstream parsing
// (pdf-parse / mammoth) will reject any binary that is not a real PDF/DOCX.
const SAFARI_GENERIC_MIME_TYPES = ['application/octet-stream', ''];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isValidMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isGenericMime = SAFARI_GENERIC_MIME_TYPES.includes(file.mimetype);
  const isValidExtension = ALLOWED_EXTENSIONS.includes(extension);

  // 1. Extension must always be .pdf or .docx
  if (!isValidExtension) {
    return cb(new Error('Invalid file extension. Only .pdf and .docx are allowed.'), false);
  }

  // 2. MIME must be either a known document type OR a Safari generic type
  if (!isValidMime && !isGenericMime) {
    return cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
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
