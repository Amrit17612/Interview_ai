import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { useInterview } from '../hooks/useInterview';
import { useSpeech } from '../hooks/useSpeech';
import { useAutosave, pruneOldDrafts } from '../hooks/useAutosave';
import { ROUTES } from '../../../constants/routes';
import { Mic, Keyboard, Volume2, ArrowRight, XCircle, LogOut } from 'lucide-react';
import { AIAvatar, type InterviewStatus } from '../components/AIAvatar';
import { FloatingCamera } from '../components/FloatingCamera';
import { AudioWaveform } from '../components/AudioWaveform';
import { motion, AnimatePresence } from 'framer-motion';

export function ActiveInterview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('id');
  const containerRef = useRef<HTMLDivElement>(null);
  
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
  } = useInterview();

  const {
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
  const [isSpeakMode, setIsSpeakMode] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const { getDraft, clearDraft } = useAutosave({
    sessionId: session?._id,
    questionId: currentQuestion?._id,
    answerText
  });

  // 0. Fullscreen Logic
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (containerRef.current && document.documentElement.requestFullscreen) {
          // Ignore error if denied, the fixed inset-0 css handles the fallback
          await document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (err) {
        // Fallback handled by CSS fixed positioning
      }
    };
    enterFullscreen();

    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // 1. Initial Load & Prune
  useEffect(() => {
    pruneOldDrafts();
    if (sessionId && (!session || session._id !== sessionId)) {
      loadSession(sessionId);
    }
  }, [sessionId, session, loadSession]);

  // 2. Countdown Logic
  useEffect(() => {
    if (!session || session.status === 'COMPLETED' || error || isLoading) return;
    
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setInterviewStarted(true);
    }
  }, [countdown, session, error, isLoading]);

  // 3. Generate First Question automatically if none exists and session is IN_PROGRESS
  useEffect(() => {
    if (interviewStarted && session && session.status === 'IN_PROGRESS' && session.questions.length === 0 && !isGeneratingQuestion && !currentQuestion && !error) {
      generateNextQuestion();
    }
  }, [interviewStarted, session, currentQuestion, isGeneratingQuestion, error, generateNextQuestion]);

  // 4. Auto-Speak Question
  const prevQuestionId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (interviewStarted && currentQuestion && currentQuestion._id !== prevQuestionId.current && ttsSupported) {
      prevQuestionId.current = currentQuestion._id;
      // Small delay to let UI settle before speaking
      setTimeout(() => {
        speak(currentQuestion.text);
      }, 500);
    }
  }, [currentQuestion, interviewStarted, ttsSupported, speak]);

  // Restore draft when question loads
  useEffect(() => {
    if (currentQuestion && !draftRestored) {
      const draft = getDraft();
      if (draft) {
        setAnswerText(draft);
      }
      setDraftRestored(true);
    } else if (!currentQuestion) {
      setDraftRestored(false);
    }
  }, [currentQuestion, getDraft, draftRestored]);

  // Sync speech transcript with answer text (Only in Speak Mode)
  useEffect(() => {
    if (isListening && isSpeakMode) {
      setAnswerText(transcript);
    }
  }, [transcript, isListening, isSpeakMode]);

  // If session is completed and has a score, auto-navigate
  useEffect(() => {
    if (session?.status === 'COMPLETED' && session.overallScore !== undefined && session.overallScore !== null) {
      navigate(`${ROUTES.INTERVIEW_REPORT}?id=${session._id}`);
    }
  }, [session, navigate]);

  const handleSubmit = async () => {
    if (!answerText.trim()) return;
    stopListening();
    stopSpeaking();
    
    try {
      await submitAnswer(answerText);
      clearDraft();
      
      const maxQ = session?.maxQuestions || 5;
      if (session && session.questions.length < maxQ) {
        setAnswerText('');
        resetTranscript();
        await generateNextQuestion();
      } else {
        await completeInterview();
      }
    } catch (err) {
      console.error('Failed to submit answer', err);
    }
  };

  const handleEndInterview = async () => {
    stopListening();
    stopSpeaking();
    try {
      await completeInterview();
    } catch (err) {
      console.error('Failed to end interview', err);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const deriveStatus = (): InterviewStatus => {
    if (!interviewStarted) return 'IDLE';
    if (isGeneratingQuestion || isSubmittingAnswer || isCompleting) return 'ANALYZING';
    if (isSpeaking) return 'AI_SPEAKING';
    if (isListening) return 'LISTENING';
    return 'READY_FOR_ANSWER';
  };

  const currentStatus = deriveStatus();

  if (!sessionId || isLoading || !session) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <AIAvatar status="IDLE" />
          <p className="mt-8 text-slate-400">Loading interview space...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-slate-900 text-white overflow-hidden flex flex-col font-sans">
      
      {/* Top Bar */}
      <header className="p-6 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
            {session.configuration.type} INTERVIEW
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-slate-400 text-sm hidden sm:block">
            Question {Math.max(1, session.questions.length)} of {session.maxQuestions || 5}
          </div>
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-4 md:px-12 w-full max-w-5xl mx-auto">
        
        <AnimatePresence mode="wait">
          {countdown !== null ? (
            <motion.div 
              key="countdown"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-8xl md:text-9xl font-bold text-white tracking-tighter"
            >
              {countdown}
            </motion.div>
          ) : session.status === 'COMPLETED' ? (
            <motion.div 
              key="completed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <h2 className="text-3xl font-bold">Interview Completed</h2>
              {isCompleting ? (
                <p className="text-brand-400 animate-pulse">Analyzing responses and generating your report...</p>
              ) : (
                <>
                  {(error || session.overallScore == null) ? (
                    <div className="text-red-400 space-y-4">
                      <p>{error || 'Report generation failed.'}</p>
                      <Button onClick={() => retryReport()} variant="outline" className="border-red-500 text-red-500">Retry</Button>
                    </div>
                  ) : (
                    <Button onClick={() => navigate(`${ROUTES.INTERVIEW_REPORT}?id=${session._id}`)}>
                      View Full Report
                    </Button>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col items-center"
            >
              
              {/* Avatar Section */}
              <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[40vh]">
                <AIAvatar status={currentStatus} />
                
                <div className="mt-8 text-center max-w-2xl px-4">
                  {currentQuestion ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl md:text-2xl font-medium leading-relaxed text-slate-100">
                        {currentQuestion.text}
                      </h3>
                      {ttsSupported && (
                        <button 
                          onClick={() => speak(currentQuestion.text)}
                          disabled={isSpeaking || isSubmittingAnswer}
                          className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 disabled:opacity-50 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                          Repeat Question
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <div className="text-slate-400 animate-pulse">
                      {isGeneratingQuestion ? 'Analyzing context...' : error ? error : 'Waiting for question...'}
                    </div>
                  )}
                </div>
              </div>

              {/* Input Section */}
              {currentQuestion && currentQuestion.status === 'PENDING' && (
                <div className="w-full shrink-0 pb-8 md:pb-12 max-w-3xl flex flex-col items-center gap-6">
                  
                  {/* Mode Toggles */}
                  <div className="flex bg-slate-800 rounded-full p-1 border border-slate-700/50">
                    <button
                      onClick={() => {
                        setIsSpeakMode(true);
                      }}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        isSpeakMode ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Mic className="w-4 h-4" /> Speak
                    </button>
                    <button
                      onClick={() => {
                        setIsSpeakMode(false);
                        stopListening();
                      }}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        !isSpeakMode ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Keyboard className="w-4 h-4" /> Type
                    </button>
                  </div>

                  {/* Dynamic Input Area */}
                  <div className="w-full relative">
                    {isSpeakMode ? (
                      <div className="flex flex-col items-center space-y-4 w-full">
                        <AudioWaveform isListening={isListening} />
                        
                        {permissionDenied && (
                          <div className="text-red-400 text-sm flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Microphone permission denied
                          </div>
                        )}
                        
                        {!permissionDenied && (
                          <button
                            onClick={toggleListen}
                            disabled={isSubmittingAnswer || isSpeaking}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                              isListening 
                                ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                                : 'bg-brand-500 hover:bg-brand-600 shadow-lg'
                            } disabled:opacity-50 disabled:cursor-not-allowed text-white`}
                            aria-label={isListening ? "Stop listening" : "Start listening"}
                          >
                            <Mic className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} />
                          </button>
                        )}
                        
                        {/* Show partial transcript preview */}
                        {answerText && (
                          <div className="w-full p-4 bg-slate-800/50 rounded-xl border border-slate-700 max-h-32 overflow-y-auto text-sm text-slate-300">
                            {answerText}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full animate-in fade-in slide-in-from-bottom-4">
                        <textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Type your answer here..."
                          className="w-full bg-slate-800 border-slate-700 text-white rounded-xl p-4 min-h-[120px] focus:ring-brand-500 focus:border-brand-500 resize-none shadow-xl"
                          disabled={isSubmittingAnswer}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmittingAnswer || isGeneratingQuestion || !answerText.trim() || currentStatus === 'AI_SPEAKING'}
                    size="lg"
                    className="w-full sm:w-auto px-12 bg-white text-slate-900 hover:bg-slate-100 mt-2"
                  >
                    {isSubmittingAnswer ? 'Analyzing Response...' : 'Submit Answer'} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Local Floating Camera Preview */}
      <FloatingCamera />

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-2">End Interview Early?</h3>
            <p className="text-slate-400 mb-6">Are you sure you want to exit? Your progress up to the last submitted question will be saved and evaluated.</p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white" onClick={() => setShowExitConfirm(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent" onClick={handleEndInterview}>
                End Interview
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}