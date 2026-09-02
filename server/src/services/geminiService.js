const { GoogleGenAI } = require('@google/genai');

// ============================================================================
// CONFIGURATION
// ============================================================================

// Model selection is isolated here to prevent scattering across the codebase.
// For initial foundation, we target a fast, cost-effective standard model.
const TARGET_MODEL = 'gemini-3.5-flash';

// Centralized safe generation config
const DEFAULT_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 4096, // Prevents run-away cost generation while supporting structured JSON
};

// Timeout boundary (e.g., 15 seconds max)
const TIMEOUT_MS = 60000;

// ============================================================================
// INITIALIZATION
// ============================================================================

let aiClient = null;

const initializeClient = () => {
  if (aiClient) return aiClient;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_key_do_not_commit' || apiKey === 'your_gemini_api_key_here') {
    throw new Error('CONFIG_ERROR: GEMINI_API_KEY is missing or invalid in backend environment.');
  }

  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
};

// ============================================================================
// UTILITIES
// ============================================================================

const withTimeout = (promise, ms) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`TIMEOUT_ERROR: Provider did not respond within ${ms}ms.`));
    }, ms);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => clearTimeout(timeoutId));
};

const normalizeError = (error) => {
  // Safe normalization mapping without exposing raw stack traces or keys
  const msg = error.message || '';
  
  if (msg.includes('CONFIG_ERROR')) {
    return new Error('AI Configuration Error: Provider is not configured.');
  }
  if (msg.includes('TIMEOUT_ERROR')) {
    return new Error('AI Timeout Error: The AI provider took too long to respond.');
  }
  if (msg.includes('401') || msg.includes('403')) {
    return new Error('AI Auth Error: Provider authentication rejected the request.');
  }
  if (msg.includes('429')) {
    return new Error('AI Rate Limit Error: Provider rate limit exceeded. Please try again later.');
  }
  if (msg.includes('500') || msg.includes('503')) {
    return new Error('AI Provider Error: The AI provider is currently unavailable.');
  }

  // Fallback for unexpected SDK errors
  return new Error('AI Unexpected Error: Failed to generate response from provider.');
};

const parseJsonSafely = (text) => {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    }
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3).trim();
    }

    // Extract everything from the first '{' to the last '}' to handle trailing garbage
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (match) {
      cleanText = match[0];
    }
    
    // Standard robust parse
    return JSON.parse(cleanText);
  } catch (_) {
    console.error('[AI SERVICE] JSON parse error on text:', text);
    throw new Error('PROVIDER_ERROR: Malformed JSON response from Gemini API.');
  }
};

const validateQuestionResponse = (data) => {
  if (!data || typeof data.question !== 'string' || typeof data.focus_area !== 'string' || !data.difficulty) {
    throw new Error('PROVIDER_ERROR: AI response missing required question fields.');
  }
  return data;
};

const validateEvaluationResponse = (data) => {
  if (!data || typeof data.score !== 'number' || data.score < 0 || data.score > 100 || typeof data.feedback !== 'string' || !Array.isArray(data.strengths) || !Array.isArray(data.improvements)) {
    throw new Error('PROVIDER_ERROR: AI response missing required evaluation fields or invalid score.');
  }
  return data;
};

const validateReportResponse = (data) => {
  if (!data || typeof data.summary !== 'string' || !Array.isArray(data.strengths) || !Array.isArray(data.weaknesses) || !Array.isArray(data.recommendations)) {
    throw new Error('PROVIDER_ERROR: AI response missing required report fields.');
  }
  
  if (!Array.isArray(data.question_evaluations)) {
    throw new Error('PROVIDER_ERROR: AI response missing question_evaluations array.');
  }
  
  data.question_evaluations.forEach((evalItem, i) => {
    if (typeof evalItem.index !== 'number' || typeof evalItem.score !== 'number' || evalItem.score < 0 || evalItem.score > 100 || typeof evalItem.feedback !== 'string') {
      throw new Error(`PROVIDER_ERROR: Invalid evaluation format at index ${i}`);
    }
  });

  return data;
};

// ============================================================================
// SERVICE METHODS
// ============================================================================

/**
 * Generic AI Generation Wrapper
 * 
 * @param {string} promptText - The fully assembled prompt string
 * @param {object} customConfig - Optional overrides for temperature/tokens
 * @returns {Promise<string>} The generated text
 */
const generateText = async (promptText, customConfig = {}) => {
  try {
    const ai = initializeClient();

    const requestConfig = {
      ...DEFAULT_CONFIG,
      ...customConfig,
      // Map SDK specific configs via destructuring if needed, though 
      // standard generateContent often takes them at the top level via config object
    };

    // The official SDK v0.1+ syntax
    const generatePromise = ai.models.generateContent({
      model: TARGET_MODEL,
      contents: promptText,
      config: requestConfig
    });

    const response = await withTimeout(generatePromise, TIMEOUT_MS);
    
    if (!response || !response.text) {
      throw new Error('PROVIDER_ERROR: Malformed response from Gemini API.');
    }

    if (requestConfig.responseMimeType === 'application/json') {
      return parseJsonSafely(response.text);
    }

    return response.text;
  } catch (error) {
    // Log safe diagnostic info internally
    console.error('[AI SERVICE] Generation failed:', error.message);
    
    // Throw normalized error outward to controller
    throw normalizeError(error);
  }
};

module.exports = {
  generateText,
  validateQuestionResponse,
  validateEvaluationResponse,
  validateReportResponse,
  TARGET_MODEL
};
