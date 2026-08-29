import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { useInterview } from '../hooks/useInterview';
import { useSpeech } from '../hooks/useSpeech';
import { useAutosave, pruneOldDrafts } from '../hooks/useAutosave';
import { ROUTES } from '../../../constants/routes';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, Save } from 'lucide-react';

export function ActiveInterview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('id');
  
  const {
    session,
    currentQuestion,
    isLoading,
    isGeneratingQuestion,
    isSubmittingAnswer,
    isCompleting,
    error,
    loadSession,
    generateNextQuestion,
    submitAnswer,
    completeInterview,
    retryReport,
    clearError
  } = useInterview();

  const {
    speechSupported,
    ttsSupported,
    isListening,
    isSpeaking,
    transcript,
    permissionDenied,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    stopSpeaking
  } = useSpeech();

  const [answerText, setAnswerText] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);

  const { getDraft, clearDraft } = useAutosave({
    sessionId: session?._id,
    questionId: currentQuestion?._id,
    answerText
  });

  // Restore draft when question loads
  useEffect(() => {
    if (currentQuestion && !draftRestored) {
      const draft = getDraft();
      if (draft) {
        setAnswerText(draft);
      }
      setDraftRestored(true);
    } else if (!currentQuestion) {
      // Reset restoration state when moving to next question
      setDraftRestored(false);
    }
  }, [currentQuestion, getDraft, draftRestored]);

  // Sync speech transcript with answer text
  useEffect(() => {
    if (isListening) {
      setAnswerText(transcript);
    }
  }, [transcript, isListening]);

  // 1. Initial Load & Prune
  useEffect(() => {
    pruneOldDrafts(); // Safely clean up old/malformed drafts
    if (sessionId && (!session || session._id !== sessionId)) {
      loadSession(sessionId);
    }
  }, [sessionId, session, loadSession]);

  // 2. Generate First Question automatically if none exists and session is IN_PROGRESS
  useEffect(() => {
    if (session && session.status === 'IN_PROGRESS' && session.questions.length === 0 && !isGeneratingQuestion && !currentQuestion && !error) {
      generateNextQuestion();
    }
  }, [session, currentQuestion, isGeneratingQuestion, error, generateNextQuestion]);

  // 3. If session is completed and has a score, auto-navigate
  useEffect(() => {
    if (session?.status === 'COMPLETED' && session.overallScore !== undefined && session.overallScore !== null) {
      navigate(`${ROUTES.INTERVIEW_REPORT}?id=${session._id}`);
    }
  }, [session, navigate]);

  if (!sessionId) {
    return (
      <Container className="py-8">
        <div className="text-center p-8 text-gray-500">No Interview Session ID provided.</div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="text-center p-8 text-gray-500">Loading interview session...</div>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container className="py-8">
        <div className="text-center p-8 text-gray-500">Session not found or failed to load.</div>
        {error && <div className="text-red-500 text-center mt-2">{error}</div>}
      </Container>
    );
  }

  const handleSubmit = async () => {
    if (!answerText.trim()) return;
    stopListening();
    stopSpeaking();
    
    try {
      // Submit answer locally via API
      await submitAnswer(answerText);
      
      // ONLY clear draft upon successful API submission
      clearDraft();
      
      // Immediately move to next or complete
      const maxQ = session.maxQuestions || 5;
      if (session.questions.length < maxQ) {
        setAnswerText(''); // Reset textarea
        resetTranscript();
        await generateNextQuestion();
      } else {
        await completeInterview();
      }
    } catch (err) {
      console.error('Failed to submit answer', err);
      // Draft is strictly preserved here because clearDraft is bypassed
    }
  };

  const handleNextQuestion = async () => {
    setAnswerText(''); // Reset textarea
    resetTranscript();
    stopSpeaking();
    await generateNextQuestion();
  };

  return (
    <Container className="py-8 max-w-4xl">
      <PageHeader 
        title={`${session.configuration.type} Interview`} 
        description={`Domain: ${session.configuration.domain} | Difficulty: ${session.configuration.difficulty}`} 
      />
      
      {(session.configuration.company || session.configuration.role) && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl flex flex-wrap items-center gap-3 shadow-sm text-sm">
          <span className="font-semibold text-gray-900">Preparing for:</span>
          {session.configuration.company && (
            <span className="bg-white border border-gray-300 px-3 py-1 rounded-full font-medium shadow-sm">
              🏢 {session.configuration.company === 'GENERIC' ? 'Generic Interview' : session.configuration.company}
            </span>
          )}
          {session.configuration.role && (
            <span className="bg-white border border-gray-300 px-3 py-1 rounded-full shadow-sm">
              💼 {session.configuration.role}
            </span>
          )}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl mb-6 border border-red-100 flex justify-between items-center">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError} className="text-red-700">Dismiss</Button>
        </div>
      )}

      {session.status === 'COMPLETED' ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6 text-center space-y-4">
          <h2 className="text-xl font-semibold mb-2">Interview Completed</h2>
          {isCompleting ? (
            <div className="text-brand-600 animate-pulse">Generating your interview report... (This may take up to 20 seconds)</div>
          ) : (
            <>
              {(error || session.overallScore == null) ? (
                <div className="text-red-600">
                  <p className="mb-4">{error || 'Your report could not be generated right now.'}</p>
                  <Button onClick={() => retryReport()}>Retry Report Generation</Button>
                </div>
              ) : (
                <Button onClick={() => navigate(`${ROUTES.INTERVIEW_REPORT}?id=${session._id}`)}>
                  View Final Report
                </Button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {/* Question Display */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">
                Question {session.questions.length} / {session.maxQuestions || 5}
              </h3>
              {isGeneratingQuestion && (
                <span className="text-sm text-brand-600 animate-pulse">Generating...</span>
              )}
            </div>
            
            {currentQuestion ? (
              <div className="space-y-4">
                <div className="text-lg text-gray-900 font-medium">
                  {currentQuestion.text}
                </div>
                {ttsSupported && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => isSpeaking ? stopSpeaking() : speak(currentQuestion.text)}
                    className="flex items-center gap-2 mt-2 text-brand-600 hover:text-brand-700 focus:ring-brand-500"
                    aria-label={isSpeaking ? 'Stop reading question aloud' : 'Read question aloud'}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                {isGeneratingQuestion ? 'AI is analyzing context to generate the next question...' : (error ? 'Failed to generate question. Please try again.' : 'Waiting for question...')}
              </div>
            )}
          </div>

          {/* Retry Button if Q1 failed */}
          {!currentQuestion && !isGeneratingQuestion && error && (
            <div className="flex justify-center mt-4">
               <Button onClick={handleNextQuestion}>Retry Generating Question</Button>
            </div>
          )}

          {/* Answer Input */}
          {currentQuestion && currentQuestion.status === 'PENDING' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <label className="block font-semibold text-gray-700">Your Answer</label>
                  {answerText.trim() !== '' && draftRestored && (
                    <span className="flex items-center gap-1 text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                      <Save className="w-3 h-3" />
                      Draft saved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isListening && (
                    <span className="flex items-center gap-2 text-sm text-red-600 font-medium animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      Listening...
                    </span>
                  )}
                  {speechSupported && !permissionDenied && (
                    <Button 
                      variant={isListening ? 'outline' : 'primary'}
                      size="sm"
                      onClick={isListening ? stopListening : startListening}
                      disabled={isSubmittingAnswer}
                      className={isListening ? "border-red-200 text-red-600 hover:bg-red-50" : "flex items-center gap-2"}
                      aria-label={isListening ? 'Stop dictation' : 'Start dictation'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isListening ? 'Stop Dictation' : 'Dictate'}
                    </Button>
                  )}
                  {permissionDenied && (
                    <span className="flex items-center gap-1 text-sm text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                      <AlertCircle className="w-4 h-4" />
                      Mic access denied
                    </span>
                  )}
                </div>
              </div>
              <textarea 
                value={answerText}
                onChange={(e) => {
                  if (isListening) stopListening();
                  setAnswerText(e.target.value);
                }}
                placeholder="Type your answer here..."
                rows={6}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border"
                disabled={isSubmittingAnswer}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmittingAnswer || isCompleting || isGeneratingQuestion || !answerText.trim()}
                >
                  {isSubmittingAnswer || isCompleting || isGeneratingQuestion ? 'Processing...' : 'Submit Answer'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}