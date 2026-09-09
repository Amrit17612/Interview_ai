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
  const textVal = row.text || row.Question || row.question || row.Q || '';
  const descVal = row.description || row.Description || row.description || '';
  const typeVal = row.type || row.Type || 'TECHNICAL';
  const diffVal = row.difficulty || row.Difficulty || 'INTERMEDIATE';

  const parsedFollowUps = [];
  for (let i = 1; i <= 20; i++) {
    const fu = row[`followup${i}`] || row[`Followup${i}`] || row[`follow-up${i}`] || row[`Follow-up ${i}`];
    if (fu && typeof fu === 'string' && fu.trim().length > 0) {
      parsedFollowUps.push(fu.trim());
    }
  }

  // Also support a comma/pipe separated list under 'followups'
  const allFu = row.followups || row.Followups || row['Follow-ups'];
  if (allFu && typeof allFu === 'string') {
    const list = parseArrayField(allFu);
    parsedFollowUps.push(...list);
  }

  return {
    text: String(textVal).trim(),
    description: descVal ? String(descVal).trim() : null,
    type: String(typeVal).trim().toUpperCase(),
    difficulty: String(diffVal).trim().toUpperCase(),
    companies: parseArrayField(row.companies || row.Companies),
    domains: parseArrayField(row.domains || row.Domains),
    roles: parseArrayField(row.roles || row.Roles),
    expectedPoints: parseArrayField(row.expectedPoints || row.ExpectedPoints || row['Expected Points']),
    tags: parseArrayField(row.tags || row.Tags),
    status: 'DRAFT',
    parsedFollowUps: [...new Set(parsedFollowUps)]
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
 * Parses a PDF buffer deterministically to extract questions and follow-ups
 */
const parsePDFDeterministic = async (buffer) => {
  const pdfData = await pdfParse(buffer, { max: 15 });
  const text = pdfData.text;

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions = [];
  let currentQ = null;
  let inFollowUps = false;

  const questionRegex = /^(?:Q(?:uestion)?\s*\d*:?\s*|\d+[\.)]\s+)(.*)/i;
  const directQuestionRegex = /^(?:Question:\s*)(.+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const qMatch = line.match(directQuestionRegex);
    const numMatch = line.match(questionRegex);
    
    // Some PDFs just put "Q001" on one line, and "Question: ..." on the next
    const isIdOnly = /^Q\d{3,}$/i.test(line);

    if (qMatch || (numMatch && numMatch[1].trim().length > 0)) {
      if (currentQ && currentQ.text) {
        questions.push(currentQ);
      }
      currentQ = {
        text: qMatch ? qMatch[1].trim() : numMatch[1].trim(),
        parsedFollowUps: [],
        type: 'TECHNICAL',
        difficulty: 'INTERMEDIATE'
      };
      inFollowUps = false;
    } else if (isIdOnly) {
      // Just skip the ID line, next line should be "Question: ..."
      continue;
    } else if (currentQ) {
      if (line.toLowerCase().startsWith('type:')) {
        currentQ.type = line.substring(5).trim().toUpperCase();
        inFollowUps = false;
      } else if (line.toLowerCase().startsWith('difficulty:')) {
        currentQ.difficulty = line.substring(11).trim().toUpperCase();
        inFollowUps = false;
      } else if (line.toLowerCase().startsWith('domain:')) {
        currentQ.domains = [line.substring(7).trim()];
        inFollowUps = false;
      } else if (line.toLowerCase().startsWith('expected points:')) {
        currentQ.expectedPoints = [line.substring(16).trim()];
        inFollowUps = false;
      } else if (line.toLowerCase().startsWith('follow-ups:') || line.toLowerCase().startsWith('followups:')) {
        inFollowUps = true;
      } else if (inFollowUps) {
        const fuText = line.replace(/^\d+[\.)]\s*/, '').replace(/^- \s*/, '').trim();
        if (fuText) currentQ.parsedFollowUps.push(fuText);
      } else if (!line.includes(':') && line.endsWith('?')) {
         // Fallback for unstructured questions
         currentQ.text += ' ' + line;
      }
    } else if (!currentQ && line.endsWith('?')) {
      currentQ = {
        text: line,
        parsedFollowUps: [],
        type: 'TECHNICAL',
        difficulty: 'INTERMEDIATE'
      };
      inFollowUps = false;
    }
  }

  if (currentQ && currentQ.text) {
    questions.push(currentQ);
  }

  const validQuestions = questions.filter(q => q.text.length > 5);
  if (validQuestions.length === 0) {
    throw new Error('No valid questions could be extracted deterministically from this PDF.');
  }

  return validQuestions.map(q => {
    const draft = mapRowToDraft({ text: q.text });
    return {
      ...draft,
      type: q.type || draft.type,
      difficulty: q.difficulty || draft.difficulty,
      domains: q.domains || draft.domains,
      expectedPoints: q.expectedPoints || draft.expectedPoints,
      parsedFollowUps: q.parsedFollowUps || []
    };
  });
};

module.exports = {
  parseCSV,
  parseXLSX,
  parsePDFDeterministic
};
