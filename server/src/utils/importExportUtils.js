const { parse } = require('csv-parse');
const xlsx = require('xlsx');
const pdfParse = require('pdf-parse');

// Helper to normalize array fields from a string
const parseArrayField = (str) => {
  if (!str) return [];
  // Support both comma and pipe separated
  const delim = str.includes('|') ? '|' : ',';
  return str.split(delim).map(s => s.trim()).filter(Boolean);
};

// Map row to a valid Question draft object
const mapRowToDraft = (row) => {
  return {
    text: row.text?.trim() || '',
    description: row.description?.trim() || null,
    type: row.type?.trim().toUpperCase() || 'TECHNICAL',
    difficulty: row.difficulty?.trim().toUpperCase() || 'INTERMEDIATE',
    companies: parseArrayField(row.companies),
    domains: parseArrayField(row.domains),
    roles: parseArrayField(row.roles),
    expectedPoints: parseArrayField(row.expectedPoints),
    tags: parseArrayField(row.tags),
    status: 'DRAFT'
  };
};

/**
 * Parses a CSV buffer into structured rows
 */
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }, (err, records) => {
      if (err) return reject(err);
      resolve(records.map(mapRowToDraft));
    });
  });
};

/**
 * Parses an XLSX buffer into structured rows (reads first sheet)
 */
const parseXLSX = (buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const records = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  return records.map(mapRowToDraft);
};

/**
 * Parses a PDF buffer deterministically to extract questions
 */
const parsePDFDeterministic = async (buffer) => {
  const pdfData = await pdfParse(buffer, { max: 15 });
  const text = pdfData.text;
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions = [];
  let currentQuestion = "";
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Match common numbering patterns: "1. ", "1) ", "Q1: ", "Q: "
    const isNewQuestion = /^(?:Q\d*:?\s*|\d+[\.)]\s+)/i.test(line);
    
    if (isNewQuestion) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = line.replace(/^(?:Q\d*:?\s*|\d+[\.)]\s+)/i, '').trim();
    } else {
      if (currentQuestion && line.length > 3) {
        currentQuestion += " " + line;
      } else if (!currentQuestion && line.endsWith('?')) {
        questions.push(line);
      }
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  const validQuestions = questions.filter(q => q.length > 5);
  if (validQuestions.length === 0) {
    throw new Error('No valid questions could be extracted deterministically from this PDF.');
  }
  
  return validQuestions.map(qText => mapRowToDraft({ text: qText }));
};

module.exports = {
  parseCSV,
  parseXLSX,
  parsePDFDeterministic
};
