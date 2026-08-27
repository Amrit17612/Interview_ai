const geminiService = require('../services/geminiService');
const prompts = require('../utils/prompts');

/**
 * Handle AI generation requests securely.
 * Protected by authMiddleware.
 */
const generateAIResponse = async (req, res) => {
  try {
    const { promptId, payload } = req.body;

    // 1. Input Validation
    if (!promptId || typeof promptId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: promptId is required and must be a string.'
      });
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: payload is required and must be an object.'
      });
    }

    // 2. Prevent payload size abuse (simple stringified check)
    if (JSON.stringify(payload).length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: payload size exceeds maximum allowed length.'
      });
    }

    // 3. User Ownership Context
    // We only trust req.user._id set by authMiddleware, ignoring req.body.userId

    // 4. Resolve Prompt (Allowlist mapping)
    let promptText = '';
    switch (promptId) {
      case 'TEST_CONNECTION':
        promptText = prompts.getTestPrompt(JSON.stringify(payload));
        break;
      // Future contexts (Interview, ATS, Resume) go here.
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid request: promptId is not recognized or allowed.'
        });
    }

    // 5. Call Abstracted AI Service
    // We do not pass provider configs (temperature, model, keys) from the client
    const generatedText = await geminiService.generateText(promptText);

    // 6. Return Clean Success Response
    return res.status(200).json({
      success: true,
      data: {
        text: generatedText
      }
    });

  } catch (error) {
    // 7. Normalize Error Responses
    const msg = error.message || '';
    
    if (msg.includes('AI Configuration Error') || msg.includes('AI Provider Error') || msg.includes('AI Timeout Error')) {
      // 503 Service Unavailable for upstream provider failures
      return res.status(503).json({
        success: false,
        message: msg
      });
    }

    if (msg.includes('AI Rate Limit Error')) {
      return res.status(429).json({
        success: false,
        message: msg
      });
    }

    if (msg.includes('AI Auth Error')) {
      return res.status(401).json({
        success: false,
        message: 'Provider authentication failed.'
      });
    }

    // Generic fallback for unexpected errors
    console.error('[AI CONTROLLER] Unexpected failure:', msg);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing the AI request.'
    });
  }
};

module.exports = {
  generateAIResponse
};
