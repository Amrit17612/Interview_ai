const COMPANY_DICTIONARY = {
  GOOGLE: {
    label: 'Google',
    emphasizedSkills: ['data structures', 'system design', 'optimization', 'performance', 'distributed systems'],
    guidance: [
      'Focus heavily on algorithmic efficiency and data structures.',
      'For system design, emphasize scalability, availability, and distributed systems.',
      'Google values clear communication of trade-offs and edge cases.'
    ],
    supportedDomains: ['TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL']
  },
  AMAZON: {
    label: 'Amazon',
    emphasizedSkills: ['leadership', 'problem solving', 'system design', 'databases', 'optimization'],
    guidance: [
      'Structure behavioral answers using the STAR method (Situation, Task, Action, Result).',
      'Tie your answers to Amazon Leadership Principles.',
      'Expect deep dives into architecture and ownership.'
    ],
    supportedDomains: ['TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL']
  },
  MICROSOFT: {
    label: 'Microsoft',
    emphasizedSkills: ['architecture', 'collaboration', 'legacy code', 'refactoring', 'oop'],
    guidance: [
      'Emphasize collaboration, inclusivity, and cross-team communication.',
      'Technical questions often focus on practical architecture and clean code.',
      'Be prepared to discuss debugging and working with large codebases.'
    ],
    supportedDomains: ['TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL']
  },
  META: {
    label: 'Meta',
    emphasizedSkills: ['performance', 'optimization', 'javascript', 'react', 'frontend'],
    guidance: [
      'Speed and execution are critical. Move fast and communicate clearly.',
      'Expect rapid-fire technical questions focused on performance and optimization.',
      'Focus on impact and data-driven decision making.'
    ],
    supportedDomains: ['TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL']
  },
  APPLE: {
    label: 'Apple',
    emphasizedSkills: ['performance', 'architecture', 'problem solving', 'collaboration'],
    guidance: [
      'Focus on user experience, quality, and attention to detail.',
      'Apple values deep domain expertise and innovation.',
      'Be ready to discuss past projects with extreme technical depth.'
    ],
    supportedDomains: ['TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL']
  },
  TCS: {
    label: 'TCS',
    emphasizedSkills: ['java', 'databases', 'sql', 'oop', 'backend'],
    guidance: [
      'Focus on core computer science fundamentals (OOP, DBMS, Networking).',
      'Be prepared for questions on standard enterprise technologies (Java, SQL).',
      'Emphasize process adherence, reliability, and teamwork.'
    ],
    supportedDomains: ['TECHNICAL', 'BEHAVIORAL', 'GENERAL']
  },
  INFOSYS: {
    label: 'Infosys',
    emphasizedSkills: ['java', 'python', 'databases', 'sql', 'oop'],
    guidance: [
      'Brush up on fundamental programming concepts and standard algorithms.',
      'Be ready to explain basic architecture and database normalization.',
      'Demonstrate a willingness to learn and adapt to new technologies.'
    ],
    supportedDomains: ['TECHNICAL', 'BEHAVIORAL', 'GENERAL']
  },
  COGNIZANT: {
    label: 'Cognizant',
    emphasizedSkills: ['databases', 'backend', 'java', 'sql', 'communication'],
    guidance: [
      'Focus on enterprise backend development and database management.',
      'Communication skills and client-facing readiness are highly valued.',
      'Be prepared for scenario-based problem-solving questions.'
    ],
    supportedDomains: ['TECHNICAL', 'BEHAVIORAL', 'GENERAL']
  },
  ACCENTURE: {
    label: 'Accenture',
    emphasizedSkills: ['project management', 'collaboration', 'architecture', 'communication'],
    guidance: [
      'Emphasize consulting skills, client communication, and adaptability.',
      'Technical rounds may focus on broad architecture and integration patterns.',
      'Be prepared to discuss agile methodologies and project management.'
    ],
    supportedDomains: ['TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'GENERAL']
  },
  GENERIC: {
    label: 'Generic Interview',
    emphasizedSkills: [],
    guidance: [
      'Focus on communicating your thought process clearly.',
      'Ensure you understand the requirements before solving technical problems.',
      'Provide specific examples from your past experience.'
    ],
    supportedDomains: ['TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'GENERAL']
  }
};

/**
 * Normalizes user input into a canonical company key safely.
 */
const normalizeCompany = (rawInput) => {
  if (!rawInput || typeof rawInput !== 'string') return null;

  const normalized = rawInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!normalized) return null;

  // Exact match
  if (COMPANY_DICTIONARY[normalized]) {
    return normalized;
  }

  // Substring match (e.g. 'TATA CONSULTANCY SERVICES' -> TCS, this is basic, usually rely on direct or just generic)
  // For safety and simplicity as required: Unknown -> GENERIC
  return 'GENERIC';
};

/**
 * Safely sanitizes a role string.
 */
const sanitizeRole = (rawInput) => {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const clean = rawInput.trim().replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, ' ');
  if (!clean) return null;
  return clean.length > 150 ? clean.substring(0, 150) : clean;
};

module.exports = {
  COMPANY_DICTIONARY,
  normalizeCompany,
  sanitizeRole
};
