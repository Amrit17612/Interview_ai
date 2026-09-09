const geminiService = require('./geminiService');
const prompts = require('../utils/prompts');

/**
 * Helper: persist a stage transition to MongoDB immediately so polling picks it up.
 * Uses updateOne for speed rather than a full save() to avoid overwriting in-flight field writes.
 */
const persistStage = async (resumeDoc, stage) => {
  resumeDoc.analysisStage = stage;
  await resumeDoc.constructor.updateOne(
    { _id: resumeDoc._id },
    { $set: { analysisStage: stage } }
  );
};

/**
 * Runs the deep resume analysis pipeline asynchronously.
 * Updates analysisStage BEFORE each real AI operation so frontend polling shows true progress.
 *
 * Resume-only flow:  IDLE → PARSING_RESUME → EVALUATING_RESUME → FINALIZING → COMPLETED
 * Resume + JD flow:  IDLE → PARSING_RESUME → EVALUATING_RESUME → PARSING_JD → MATCHING_ATS → FINALIZING → COMPLETED
 * Failure at any stage: analysisStatus=FAILED, analysisStage=FAILED
 *
 * @param {Object} resumeDoc - Mongoose Resume document (already marked PROCESSING)
 * @param {Object} jdDoc     - Mongoose JobDescription document (optional)
 */
const runAsyncAnalysis = async (resumeDoc, jdDoc) => {
  try {
    const rawText = resumeDoc.parsedText;
    if (!rawText) {
      throw new Error('Resume has no parsed text to analyze.');
    }

    // ── Stage 1: Structural Parsing ──────────────────────────────────────────
    await persistStage(resumeDoc, 'PARSING_RESUME');
    console.log(`[ANALYSIS ENGINE] Parsing structure for resume ${resumeDoc._id}`);
    const parsePrompt = prompts.getParseResumePrompt(rawText);
    const parsedDataResponse = await geminiService.generateText(parsePrompt, { responseMimeType: 'application/json' });
    const structuredData = geminiService.validateParseResumeResponse(parsedDataResponse);
    resumeDoc.structuredData = structuredData;

    // ── Stage 2: Quality Evaluation ──────────────────────────────────────────
    await persistStage(resumeDoc, 'EVALUATING_RESUME');
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

    // ── Stage 3 & 4: JD Match & ATS Score (only when JD provided) ────────────
    if (jdDoc) {
      await persistStage(resumeDoc, 'PARSING_JD');
      console.log(`[ANALYSIS ENGINE] Parsing JD ${jdDoc._id} for resume ${resumeDoc._id}`);
      const jdPrompt = prompts.getAnalyzeJDPrompt(jdDoc.content);
      const jdDataResponse = await geminiService.generateText(jdPrompt, { responseMimeType: 'application/json' });
      const structuredJD = geminiService.validateAnalyzeJDResponse(jdDataResponse);

      await persistStage(resumeDoc, 'MATCHING_ATS');
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
      resumeDoc.atsScore = null;
      resumeDoc.atsBreakdown = null;
      resumeDoc.jdAnalysis = null;
      resumeDoc.analyzedJobId = null;
    }

    // ── Stage 5: Finalizing ───────────────────────────────────────────────────
    await persistStage(resumeDoc, 'FINALIZING');

    resumeDoc.analysisStatus = 'COMPLETED';
    resumeDoc.analysisStage = 'COMPLETED';
    resumeDoc.lastAnalyzedAt = new Date();
    await resumeDoc.save();

    console.log(`[ANALYSIS ENGINE] Successfully completed analysis for resume ${resumeDoc._id}`);
  } catch (error) {
    console.error(`[ANALYSIS ENGINE] Failed analysis for resume ${resumeDoc._id}:`, error);
    resumeDoc.analysisStatus = 'FAILED';
    resumeDoc.analysisStage = 'FAILED';
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
