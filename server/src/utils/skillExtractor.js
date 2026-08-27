/**
 * Deterministic Skill Extraction Utility
 * Extracts a predefined set of recognized skills from raw text.
 * No AI/Gemini calls are made here.
 */

// Dictionary strictly aligned with current questionLibrary.json skills.
// Aliases are defined to safely map common terms to the standardized skill name.
const SKILL_DICTIONARY = {
  'communication': ['communication', 'communicate', 'communicating'],
  'learning': ['learning', 'learn', 'fast learner'],
  'conflict resolution': ['conflict resolution', 'dispute resolution', 'conflict management'],
  'collaboration': ['collaboration', 'collaborate', 'teamwork', 'team player'],
  'leadership': ['leadership', 'lead', 'leader', 'managing teams'],
  'project management': ['project management', 'agile', 'scrum', 'kanban'],
  'data structures': ['data structures', 'dsa', 'arrays', 'linked lists', 'trees', 'graphs'],
  'immutability': ['immutability', 'immutable'],
  'databases': ['databases', 'database', 'dbms'],
  'sql': ['sql', 'mysql', 'postgresql', 'relational database'],
  'mongodb': ['mongodb', 'mongo', 'nosql'],
  'optimization': ['optimization', 'optimize', 'optimizing'],
  'performance': ['performance', 'high performance', 'latency', 'throughput'],
  'system design': ['system design', 'systems design'],
  'architecture': ['architecture', 'software architecture', 'microservices', 'monolith'],
  'distributed systems': ['distributed systems', 'distributed'],
  'rate limiting': ['rate limiting', 'rate limiter', 'throttling'],
  'problem solving': ['problem solving', 'problem solver', 'troubleshooting'],
  'legacy code': ['legacy code', 'legacy systems', 'old codebase'],
  'refactoring': ['refactoring', 'refactor', 'clean code'],
  'javascript': ['javascript', 'js', 'es6'],
  'react': ['react', 'reactjs', 'react js', 'react.js'],
  'node.js': ['node.js', 'nodejs', 'node js', 'node'],
  'express': ['express', 'express.js', 'expressjs'],
  'java': ['java', 'jvm'],
  'c++': ['c++', 'cpp'],
  'python': ['python', 'django', 'flask'],
  'html/css': ['html', 'css', 'html5', 'css3', 'html/css'],
  'rest apis': ['rest apis', 'rest api', 'rest', 'restful'],
  'git': ['git', 'github', 'gitlab', 'version control'],
  'computer networks': ['computer networks', 'networking', 'tcp/ip', 'http', 'https'],
  'oop': ['oop', 'object oriented programming', 'object-oriented'],
  'backend': ['backend', 'back end', 'back-end', 'server side'],
  'frontend': ['frontend', 'front end', 'front-end', 'client side'],
  'full stack': ['full stack', 'fullstack', 'full-stack']
};

/**
 * Normalizes text and matches against the predefined skill dictionary.
 * @param {string} text Raw unstructured text (from Resume or ATS).
 * @returns {string[]} Array of matched standardized skill names.
 */
const extractSkills = (text) => {
  if (!text || typeof text !== 'string') return [];

  // Normalize text: lowercase, replace punctuation with spaces to avoid boundary issues
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9]/g, ' ');

  const foundSkills = new Set();

  for (const [standardSkill, aliases] of Object.entries(SKILL_DICTIONARY)) {
    for (const alias of aliases) {
      // Use regex word boundary to match exact alias words safely
      // We also replace non-alphanumeric in alias to match the normalized text format
      const normalizedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, ' ');
      const regex = new RegExp(`\\b${normalizedAlias}\\b`, 'i');
      
      if (regex.test(normalizedText)) {
        foundSkills.add(standardSkill);
        break; // Once we find the standard skill, no need to check other aliases for it
      }
    }
  }

  return Array.from(foundSkills);
};

module.exports = {
  extractSkills,
  SKILL_DICTIONARY
};
