const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const MAX_TEXT_LENGTH = 15000; // reasonable limit for a resume (approx 3000 words)

/**
 * Extracts text from a PDF file
 * @param {string} filePath - Absolute path to the file
 * @returns {Promise<string>}
 */
const parsePDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text || '';
};

/**
 * Extracts text from a DOCX file
 * @param {string} filePath - Absolute path to the file
 * @returns {Promise<string>}
 */
const parseDOCX = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || '';
};

/**
 * Normalizes extracted text
 * - Removes excessive whitespace
 * - Removes excessive blank lines
 * - Truncates to MAX_TEXT_LENGTH
 * @param {string} text - The raw text
 * @returns {string}
 */
const normalizeText = (text) => {
  if (!text) return '';
  let cleaned = text.replace(/\r\n/g, '\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
  cleaned = cleaned.replace(/[ \t]+/g, ' '); // Collapse horizontal spaces
  cleaned = cleaned.trim();
  
  if (cleaned.length > MAX_TEXT_LENGTH) {
    cleaned = cleaned.substring(0, MAX_TEXT_LENGTH) + '\n...[TRUNCATED]';
  }
  
  return cleaned;
};

/**
 * Main entry point for parsing a resume file
 * @param {string} filePath - Absolute path to the file
 * @param {string} mimeType - The mimetype of the file
 * @returns {Promise<string>} The normalized extracted text
 */
const parseResume = async (filePath, mimeType) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('File does not exist at the specified path.');
  }

  let rawText = '';
  
  if (mimeType === 'application/pdf') {
    rawText = await parsePDF(filePath);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    rawText = await parseDOCX(filePath);
  } else {
    throw new Error('Unsupported file type for parsing.');
  }

  const normalizedText = normalizeText(rawText);
  
  if (!normalizedText) {
    throw new Error('Parsing succeeded but yielded no text.');
  }
  
  return normalizedText;
};

module.exports = {
  parseResume,
  parsePDF,
  parseDOCX
};
