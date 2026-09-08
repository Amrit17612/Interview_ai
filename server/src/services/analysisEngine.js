const geminiService = require('./geminiService');
const prompts = require('../utils/prompts');

/**
 * Runs the deep resume analysis pipeline asynchronously.
 * This is meant to run in the background because Gemini might take 10-20 seconds.
 * 
 * @param {Object} resumeDoc - Mongoose Resume document
 * @param {Object} jdDoc - Mongoose JobDescription document (optional)
 */
const runAsyncAnalysis = async (resumeDoc, jdDoc) => {
  try {
    const rawText = resumeDoc.parsedText;
    if (!rawText) {
      throw new Error('Resume has no parsed text to analyze.');
    }

    // 1. Structural Parsing
    console.log(`[ANALYSIS ENGINE] Parsing structure for resume ${resumeDoc._id}`);
    const parsePrompt = prompts.getParseResumePrompt(rawText);
    const parsedDataResponse = await geminiService.generateText(parsePrompt, { responseMimeType: 'application/json' });
    const structuredData = geminiService.validateParseResumeResponse(parsedDataResponse);
    resumeDoc.structuredData = structuredData;

    // 2. Evaluate Quality (Grammar, Weak Bullets, Repetitive Verbs)
    console.log(`[ANALYSIS ENGINE] Evaluating quality for resume ${resumeDoc._id}`);
    const evaluatePrompt = prompts.getEvaluateResumePrompt(rawText);
    const evaluateResponse = await geminiService.generateText(evaluatePrompt, { responseMimeType: 'application/json' });
    const qualityData = geminiService.validateEvaluateResumeResponse(evaluateResponse);
    
    resumeDoc.qualityScore = qualityData.qualityScore;
    resumeDoc.contentAnalysis = {
      grammarIssues: qualityData.grammarIssues,
      repeatedVerbs: qualityData.repeatedVerbs,
      weakBullets: qualityData.weakBullets
    };
    resumeDoc.consistencyIssues = qualityData.consistencyIssues || [];
    resumeDoc.formattingIssues = qualityData.formattingIssues || [];

    // 3. JD Match & ATS Score (If JD is provided)
    if (jdDoc) {
      console.log(`[ANALYSIS ENGINE] Parsing JD ${jdDoc._id} for resume ${resumeDoc._id}`);
      const jdPrompt = prompts.getAnalyzeJDPrompt(jdDoc.content);
      const jdDataResponse = await geminiService.generateText(jdPrompt, { responseMimeType: 'application/json' });
      const structuredJD = geminiService.validateAnalyzeJDResponse(jdDataResponse);

      console.log(`[ANALYSIS ENGINE] Matching ATS Score for resume ${resumeDoc._id} against JD ${jdDoc._id}`);
      const matchPrompt = prompts.getMatchATSScorePrompt(structuredData, structuredJD);
      const matchResponse = await geminiService.generateText(matchPrompt, { responseMimeType: 'application/json' });
      const matchData = geminiService.validateMatchATSScoreResponse(matchResponse);

      resumeDoc.atsScore = matchData.atsScore;
      resumeDoc.atsBreakdown = matchData.breakdown;
      resumeDoc.jdAnalysis = {
        role: structuredJD.role,
        seniority: structuredJD.seniority,
        matchedKeywords: matchData.matchedKeywords,
        missingKeywords: matchData.missingKeywords,
        skillGaps: matchData.skillGaps,
        experienceGaps: matchData.experienceGaps,
        recommendations: matchData.recommendations
      };
      resumeDoc.analyzedJobId = jdDoc._id;
    } else {
      // Default to nulls if no JD
      resumeDoc.atsScore = null;
      resumeDoc.atsBreakdown = null;
      resumeDoc.jdAnalysis = null;
      resumeDoc.analyzedJobId = null;
    }

    // Mark as completed
    resumeDoc.analysisStatus = 'COMPLETED';
    resumeDoc.lastAnalyzedAt = new Date();
    await resumeDoc.save();

    console.log(`[ANALYSIS ENGINE] Successfully completed analysis for resume ${resumeDoc._id}`);
  } catch (error) {
    console.error(`[ANALYSIS ENGINE] Failed analysis for resume ${resumeDoc._id}:`, error);
    resumeDoc.analysisStatus = 'FAILED';
    try {
      await resumeDoc.save();
    } catch (saveError) {
      console.error(`[ANALYSIS ENGINE] Failed to save FAILED status for resume ${resumeDoc._id}:`, saveError);
    }
  }
};

module.exports = {
  runAsyncAnalysis
};
