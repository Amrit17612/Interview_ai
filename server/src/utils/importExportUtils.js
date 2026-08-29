const { parse } = require('csv-parse');
const xlsx = require('xlsx');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

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
 * Parses a PDF buffer and uses Gemini to extract questions
 */
const parsePDFWithAI = async (buffer) => {
  const pdfData = await pdfParse(buffer, { max: 15 }); // Limit to 15 pages for safety
  
  const prompt = `You are a technical interview question extraction tool. 
I am providing you with the text extracted from a PDF document.
Extract all interview questions you can find and return them strictly as a JSON array of objects.

Each object must EXACTLY match this schema:
{
  "text": "The actual question text",
  "description": "Optional context or description, or null",
  "type": "TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "GENERAL",
  "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
  "companies": ["company names if mentioned"],
  "domains": ["domains if mentioned"],
  "roles": ["roles if mentioned"],
  "expectedPoints": ["expected answer points or grading criteria if mentioned"],
  "tags": ["relevant tags if mentioned"]
}

Do not include any other text, markdown blocks like \`\`\`json, or explanations. Only output the raw JSON array.

TEXT TO EXTRACT FROM:
${pdfData.text}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.1,
    }
  });

  let textResponse = response.text || '[]';
  // Strip potential markdown JSON fences if Gemini adds them despite instructions
  textResponse = textResponse.replace(/^```json/m, '').replace(/^```/m, '').trim();

  const parsed = JSON.parse(textResponse);
  if (!Array.isArray(parsed)) {
    throw new Error('AI extraction failed to return an array.');
  }

  return parsed.map(mapRowToDraft);
};

module.exports = {
  parseCSV,
  parseXLSX,
  parsePDFWithAI
};
