import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { useInterview } from '../hooks/useInterview';
import { useSpeech } from '../hooks/useSpeech';
import { useAutosave, pruneOldDrafts } from '../hooks/useAutosave';
import { ROUTES } from '../../../constants/routes';
import { Mic, Keyboard, Volume2, ArrowRight, XCircle, Wifi, StopCircle, Loader2 } from 'lucide-react';
import { AIAvatar, type InterviewStatus } from '../components/AIAvatar';
import { FloatingCamera } from '../components/FloatingCamera';
import { AudioWaveform } from '../components/AudioWaveform';
import { streamCache } from '../utils/streamCache';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecurityMonitor } from '../hooks/useSecurityMonitor';
import { ShieldAlert } from 'lucide-react';

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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (answerText.trim()) {
      setValidationError(null);
    }
  }, [answerText]);

  const { getDraft, clearDraft } = useAutosave({
    sessionId: session?._id,
    questionId: currentQuestion?._id,
    answerText
  });

  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (interviewStarted && hiddenVideoRef.current) {
      const stream = streamCache.cameraStream;
      if (stream) {
        hiddenVideoRef.current.srcObject = stream;
      }
    }
  }, [interviewStarted]);

  const { warnings, flushPendingEvents } = useSecurityMonitor(session?._id || null, interviewStarted, hiddenVideoRef);

  // Expose recent high/medium warning if any
  const [activeWarning, setActiveWarning] = useState<string | null>(null);
  useEffect(() => {
    if (warnings.length > 0) {
      const lastWarning = warnings[warnings.length - 1];
      if (['MEDIUM', 'HIGH'].includes(lastWarning.severity)) {
        let msg = 'Security violation detected.';
        if (lastWarning.type === 'TAB_SWITCH' || lastWarning.type === 'FOCUS_LOST') msg = 'You have left the interview window. Please return to the interview.';
        if (lastWarning.type.includes('COPY') || lastWarning.type.includes('PASTE')) msg = 'Clipboard operations are restricted.';
        if (lastWarning.type === 'NO_FACE') msg = 'Face not detected. Please remain visible.';
        if (lastWarning.type === 'MULTIPLE_FACES') msg = 'Multiple faces detected in camera view.';

        setActiveWarning(msg);
        const timer = setTimeout(() => setActiveWarning(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [warnings]);

  // 0. Network Listener & Body Scroll Lock
  useEffect(() => {
    // Disable document scrolling while in interview
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Timer Logic
  useEffect(() => {
    if (!interviewStarted || session?.status === 'COMPLETED') return;
    const interval = setInterval(() => {
      if (session?.createdAt) {
        setElapsedTime(Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 1000));
      } else {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [interviewStarted, session?.status, session?.createdAt]);

  // Initial Load & Prune
  useEffect(() => {
    pruneOldDrafts();
    if (sessionId && (!session || session._id !== sessionId)) {
      loadSession(sessionId);
    }
  }, [sessionId, session, loadSession]);

  // Countdown Logic
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

  // Generate First Question automatically if none exists and session is IN_PROGRESS
  useEffect(() => {
    if (interviewStarted && session && session.status === 'IN_PROGRESS' && session.questions.length === 0 && !isGeneratingQuestion && !currentQuestion && !error) {
      generateNextQuestion();
    }
  }, [interviewStarted, session, currentQuestion, isGeneratingQuestion, error, generateNextQuestion]);

  // Auto-Speak Question
  const prevQuestionId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (interviewStarted && currentQuestion && currentQuestion._id !== prevQuestionId.current && ttsSupported) {
      prevQuestionId.current = currentQuestion._id;
      // Small delay to let UI settle before speaking
      setTimeout(() => {
        speak(currentQuestion.text);
      }, 800);
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

  // Sync speech transcript with answer text
  useEffect(() => {
    if (isListening && isSpeakMode && transcript) {
      setAnswerText(transcript);
    }
  }, [transcript, isListening, isSpeakMode]);

  // If session is completed and has a score, auto-navigate to feedback.
  // Restored from pre-regression (7fd0223c^): requires session._id === sessionId
  // (prevents stale context from firing), status === COMPLETED, and overallScore
  // present (fires only after async report generation completes, not immediately).
  useEffect(() => {
    if (session?._id === sessionId && session?.status === 'COMPLETED' && session.overallScore !== undefined && session.overallScore !== null) {
      navigate(`${ROUTES.INTERVIEW_FEEDBACK}?id=${session._id}`);
    }
  }, [session, sessionId, navigate]);

  // Polling logic for async report generation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (session && session.status === 'COMPLETED' && session.overallScore == null && session.reportStatus !== 'FAILED') {
      interval = setInterval(() => {
        loadSession(session._id);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, loadSession]);

  // Clean up speech on mode switch
  useEffect(() => {
    if (!isSpeakMode && isListening) {
      stopListening();
    }
  }, [isSpeakMode, isListening, stopListening]);

  // Ensure speech stops on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  const handleSubmit = async () => {
    const finalAnswer = answerText.trim();
    if (!finalAnswer) {
      setValidationError('Please answer the current question before continuing.');
      return;
    }

    setValidationError(null);
    stopListening();
    stopSpeaking();

    try {
      await submitAnswer(finalAnswer);
      clearDraft();

      const maxQ = session?.maxQuestions || 5;
      if (session && session.questions.length < maxQ) {
        setAnswerText('');
        resetTranscript();
        await generateNextQuestion();
      } else {
        await flushPendingEvents();
        await completeInterview();
      }
    } catch (err) {
      console.error('Failed to submit answer', err);
    }
  };

  const handleEndInterviewEarly = async () => {
    stopListening();
    stopSpeaking();
    setShowExitConfirm(false);
    try {
      await flushPendingEvents();
      await completeInterview();
    } catch (err) {
      console.error('Failed to end interview', err);
    }
  };

  const toggleListen = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const deriveStatus = (): InterviewStatus => {
    if (!interviewStarted) return 'IDLE';
    if (isGeneratingQuestion || isSubmittingAnswer || isCompleting) return 'ANALYZING';
    if (isSpeaking) return 'AI_SPEAKING';
    if (isListening) return 'LISTENING';
    return 'READY_FOR_ANSWER';
  };

  const currentStatus = deriveStatus();

  const getStatusMessage = () => {
    switch(currentStatus) {
      case 'ANALYZING': return 'Analyzing your response...';
      case 'AI_SPEAKING': return 'AI is speaking...';
      case 'LISTENING': return 'I\'m listening...';
      case 'READY_FOR_ANSWER': return 'Your turn';
      default: return '';
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Failed to load session</h2>
            <p className="text-slate-400">{error}</p>
          </div>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)} className="w-full bg-white text-slate-900 hover:bg-slate-200">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionId || isLoading || !session) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-4" />
          <p className="text-slate-400">Loading interview space...</p>
        </div>
      </div>
    );
  }

  const isFinalQuestion = session && session.questions.length === (session.maxQuestions || 5);

  return (
    <div ref={containerRef} className="fixed top-0 left-0 w-full h-[100dvh] z-[100] bg-slate-950 text-white overflow-hidden flex flex-col font-sans selection:bg-brand-500/30 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <video ref={hiddenVideoRef} autoPlay playsInline muted className="hidden" />

      <AnimatePresence>
        {activeWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-medium"
          >
            <ShieldAlert className="w-5 h-5" />
            {activeWarning}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Visual Depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.015] mix-blend-overlay" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 px-6 py-4 flex justify-between items-center bg-slate-950/50 backdrop-blur-md border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
              AI INTERVIEW
            </span>
            <span className="text-[10px] text-slate-500 capitalize">{session.configuration.type} • {session.configuration.difficulty}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
          <span className="text-xs font-semibold text-slate-300">
            Question {Math.max(1, session.questions.length)} / {session.maxQuestions || 5}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-white/5 backdrop-blur-sm shadow-inner">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">LIVE</span>
            </div>
            <span className="text-xs font-medium text-slate-200 font-mono border-l border-white/10 pl-2 ml-1">
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-2 md:py-6 overflow-hidden">

        <AnimatePresence mode="wait">
          {countdown !== null ? (
            <motion.div
              key="countdown"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
              className="m-auto flex flex-col items-center justify-center"
            >
              <div className="text-8xl md:text-[150px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 tracking-tighter">
                {countdown}
              </div>
            </motion.div>
          ) : (session._id === sessionId && (session.status === 'COMPLETED' || isCompleting)) ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="m-auto flex flex-col items-center text-center p-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-md w-full"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                <Wifi className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Interview Completed</h2>
              <p className="text-slate-400 mb-8 text-sm">Your responses have been successfully recorded.</p>

              {isCompleting || (session.overallScore == null && session.reportStatus !== 'FAILED' && !error) ? (
                <div className="w-full flex flex-col items-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                  <p className="text-brand-400 text-sm font-medium animate-pulse">Building your personalized report...</p>
                </div>
              ) : (
                <>
                  {(error || session.reportStatus === 'FAILED' || session.overallScore == null) ? (
                    <div className="w-full text-red-400 space-y-4">
                      <p className="text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error || 'Report generation failed.'}</p>
                      <Button onClick={() => retryReport()} variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300">Retry Generation</Button>
                    </div>
                  ) : (
                    <div className="mt-8 space-y-4">
                      <Button onClick={() => navigate(`${ROUTES.INTERVIEW_FEEDBACK}?id=${session._id}`)} size="lg" className="w-full bg-white text-slate-900 hover:bg-slate-200">
                        Give Feedback & View Results <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col items-center flex-1"
            >

              {/* AI Avatar Area */}
              <div className="flex flex-col items-center justify-center shrink-0 mb-4 md:mb-6 mt-2">
                <div className="relative scale-75 md:scale-100 transform origin-top">
                  <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                  <AIAvatar status={currentStatus} />
                </div>
                <div className="h-6 mt-4">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentStatus}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs font-semibold tracking-widest uppercase text-brand-400"
                    >
                      {getStatusMessage()}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* Question Card */}
              <div className="w-full max-w-3xl shrink-0 max-h-[30vh] flex flex-col mb-4 md:mb-6">
                <AnimatePresence mode="wait">
                  {currentQuestion ? (
                    <motion.div
                      key={currentQuestion._id}
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.98 }}
                      className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl relative flex flex-col min-h-0 group"
                    >
                      {/* Subtle ambient glow inside card */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-brand-500/5 blur-3xl rounded-full pointer-events-none" />

                      <div className="flex justify-between items-start mb-3 md:mb-6 shrink-0 relative z-10">
                        <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                          Question {session.questions.length} / {session.maxQuestions || 5}
                        </span>
                        {ttsSupported && (
                          <button
                            onClick={() => speak(currentQuestion.text)}
                            disabled={isSpeaking || isSubmittingAnswer}
                            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-brand-400 disabled:opacity-50 transition-colors bg-white/5 hover:bg-brand-500/10 px-3 py-1.5 rounded-full border border-white/5"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            Repeat
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto custom-scrollbar pr-2 relative z-10 min-h-0 flex-1">
                        <h3 className="text-lg md:text-2xl font-medium leading-relaxed text-white">
                          {currentQuestion.text}
                        </h3>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="loading-question"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center text-slate-400 min-h-[200px]"
                    >
                      <Loader2 className="w-6 h-6 animate-spin text-brand-500 mb-4" />
                      {isGeneratingQuestion ? 'Generating next question...' : error ? <span className="text-red-400">{error}</span> : 'Waiting...'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Answer / Input Area */}
              {currentQuestion && currentQuestion.status === 'PENDING' && (
                <div className="w-full max-w-3xl flex-1 min-h-0 flex flex-col pb-2">
                  <AnimatePresence mode="wait">
                    {isSpeakMode ? (
                      <motion.div
                        key="speak-mode"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex-1 min-h-0 flex flex-col items-center justify-center bg-slate-900/30 border border-white/5 rounded-3xl p-4 md:p-8"
                      >
                        {!permissionDenied ? (
                          <>
                            <div className="h-16 w-full max-w-xs mb-8 flex items-center justify-center">
                              <AudioWaveform isListening={isListening} stream={streamCache.cameraStream} />
                            </div>

                            <button
                              onClick={toggleListen}
                              disabled={isSubmittingAnswer || isSpeaking}
                              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isListening
                                  ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_40px_rgba(239,68,68,0.5)] scale-105'
                                  : 'bg-slate-800 hover:bg-slate-700 border border-white/10 shadow-xl'
                              } disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed`}
                              aria-label={isListening ? "Stop listening" : "Start listening"}
                            >
                              <Mic className={`w-8 h-8 ${isListening ? 'text-white' : 'text-slate-300'}`} />
                            </button>

                            {answerText && (
                              <div className="mt-8 w-full p-4 bg-slate-950/50 backdrop-blur-sm rounded-2xl border border-white/5 text-sm text-slate-300 max-h-40 overflow-y-auto custom-scrollbar">
                                <span className="text-xs text-brand-400 uppercase font-bold tracking-wider mb-2 block">Your Response</span>
                                {answerText}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center text-red-400 flex flex-col items-center">
                            <XCircle className="w-8 h-8 mb-3 opacity-80" />
                            <p className="font-medium mb-1">Microphone Access Denied</p>
                            <p className="text-sm opacity-80">Please use Type mode below.</p>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="type-mode"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex-1 min-h-0 w-full flex flex-col relative"
                      >
                        <textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Type your answer here..."
                          className="flex-1 w-full min-h-0 bg-slate-900/60 backdrop-blur-md border border-white/10 text-white rounded-3xl p-4 md:p-6 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 resize-none shadow-2xl custom-scrollbar text-base md:text-lg leading-relaxed placeholder:text-slate-600 transition-all pb-10"
                          disabled={isSubmittingAnswer}
                        />
                        <div className="absolute bottom-4 right-6 text-xs text-slate-500 font-mono">
                          {answerText.length} chars
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Validation Error Message */}
      {validationError && (
        <div className="w-full flex justify-center px-4 pb-2 z-20">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2">
            {validationError}
          </div>
        </div>
      )}

      {/* Bottom Footer Control Bar */}
      {interviewStarted && session?.status !== 'COMPLETED' && currentQuestion && (
        <footer className="shrink-0 w-full p-3 md:p-6 bg-slate-950 border-t border-white/5 z-20 flex justify-center">
          <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">

            {/* Left: Finish Early */}
            <Button
              variant="ghost"
              onClick={() => setShowExitConfirm(true)}
              disabled={isCompleting}
              className="text-slate-400 hover:text-white hover:bg-white/5 w-full sm:w-auto shrink-0 order-3 sm:order-1"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Finish</span> Interview
            </Button>

            {/* Center: Mode Switcher */}
            <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 w-full sm:w-auto order-1 sm:order-2">
              <button
                onClick={() => setIsSpeakMode(true)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isSpeakMode ? 'bg-white text-slate-900 shadow-md scale-100' : 'text-slate-400 hover:text-slate-200 scale-95'
                }`}
              >
                <Mic className="w-4 h-4" /> Speak
              </button>
              <button
                onClick={() => setIsSpeakMode(false)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  !isSpeakMode ? 'bg-white text-slate-900 shadow-md scale-100' : 'text-slate-400 hover:text-slate-200 scale-95'
                }`}
              >
                <Keyboard className="w-4 h-4" /> Type
              </button>
            </div>

            {/* Right: Submit */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmittingAnswer || isGeneratingQuestion || (!answerText.trim() && !isSpeakMode) || currentStatus === 'AI_SPEAKING' || isCompleting}
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] shrink-0 order-2 sm:order-3"
            >
              {isSubmittingAnswer ? 'Analyzing...' : isFinalQuestion ? 'Submit & Finish' : 'Submit Answer'}
              {!isSubmittingAnswer && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </footer>
      )}

      {/* Local Floating Camera Preview */}
      <FloatingCamera />

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center"
          >
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <StopCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Finish Interview Early?</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              You have answered {Math.max(0, session?.questions.length ? session.questions.length - (currentQuestion ? 1 : 0) : 0)} of {session?.maxQuestions || 5} questions.
              {currentQuestion && ' The current question will be skipped.'}
              <br/><br/>
              Your completed answers will be analyzed and included in your final report.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => setShowExitConfirm(false)}>
                Continue Interview
              </Button>
              <Button className="flex-1 bg-white hover:bg-slate-200 text-slate-900 border-transparent shadow-xl" onClick={handleEndInterviewEarly} disabled={isCompleting}>
                Finish Now
              </Button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}