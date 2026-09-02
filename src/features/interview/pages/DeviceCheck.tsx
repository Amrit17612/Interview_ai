import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import { useSpeech } from '../hooks/useSpeech';
import { AudioWaveform } from '../components/AudioWaveform';
import { 
  Camera, 
  Mic, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { streamCache } from '../utils/streamCache';

type Step = 1 | 2 | 3 | 4;
type CheckStatus = 'idle' | 'checking' | 'success' | 'error' | 'warning';

export function DeviceCheck() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id');

  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Statuses
  const [micStatus, setMicStatus] = useState<CheckStatus>('idle');
  const [camStatus, setCamStatus] = useState<CheckStatus>('idle');
  const [netStatus, setNetStatus] = useState<CheckStatus>('idle');
  
  // Microphone Test State
  const { startListening, stopListening, transcript, ttsSupported } = useSpeech();
  const [audioLevelDetected, setAudioLevelDetected] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Unified Stream State
  const [globalStream, setGlobalStream] = useState<MediaStream | null>(null);
  const streamInitializingRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleVideoRef = (node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && globalStream) {
      if (node.srcObject !== globalStream) {
        node.srcObject = globalStream;
      }
      node.play().catch((err) => console.warn('Video play blocked initially', err));
    }
  };

  // Consent
  const [consentGiven, setConsentGiven] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState<'terms' | 'privacy' | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate(ROUTES.INTERVIEW);
    }
  }, [sessionId, navigate]);

  // UNIFIED STREAM ACQUISITION
  useEffect(() => {
    let active = true;

    const initStream = async () => {
      // 1. Check if we already have a valid cached stream
      if (streamCache.cameraStream && streamCache.cameraStream.active) {
        if (active) {
          setGlobalStream(streamCache.cameraStream);
        }
        return;
      }
      
      // 2. Prevent duplicate calls (React StrictMode / Remounts)
      if (streamInitializingRef.current) return;
      streamInitializingRef.current = true;

      try {
        // Acquire BOTH mic and camera once
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        
        // Save to cache immediately so ActiveInterview can use it
        streamCache.setCameraStream(stream);
        
        if (active) {
          setGlobalStream(stream);
        }
      } catch (err) {
        console.error("Failed to acquire unified stream", err);
      } finally {
        streamInitializingRef.current = false;
      }
    };

    initStream();
    
    return () => {
      active = false;
    };
  }, []);

  // Clean up ONLY audio context / speech on unmount.
  // DO NOT stop the global stream tracks here, as ActiveInterview needs them!
  useEffect(() => {
    return () => {
      stopListening();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stopListening]);

  // ----------------------------------------------------
  // STEP 1: MICROPHONE
  // ----------------------------------------------------
  useEffect(() => {
    if (currentStep !== 1) return;
    if (micStatus !== 'checking') return;

    if (!globalStream) {
      // If globalStream failed, mark error (wait slightly to ensure initialization finished)
      if (!streamInitializingRef.current && !streamCache.cameraStream) {
        setMicStatus('error');
      }
      return;
    }
    
    const checkAudioLevel = async () => {
      try {
        // Start listening for transcript if supported
        try { startListening(); } catch (e) { console.warn('SpeechRecognition unavailable', e); }

        // Setup audio level detection using the unified globalStream
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyserRef.current = analyser;
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(globalStream);
        sourceRef.current = source;
        source.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        dataArrayRef.current = dataArray;

        let detected = false;
        let baseline = 0;
        let baselineSamples = 0;
        let sustainedFrames = 0;
        
        const checkLevel = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
          
          let sum = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
          }
          const average = sum / dataArrayRef.current.length;
          
          // Phase 1: Establish ambient baseline (approx 30 frames ~ 0.5s)
          if (baselineSamples < 30) {
            baseline += average;
            baselineSamples++;
            if (baselineSamples === 30) {
              baseline = baseline / 30;
            }
          } else {
            // Phase 2: Detect sustained speech significantly above baseline
            const threshold = Math.max(baseline * 1.5, 12); 
            
            if (average > threshold) {
              sustainedFrames++;
              if (sustainedFrames > 10 && !detected) {
                setAudioLevelDetected(true);
              }
              if (sustainedFrames > 45 && !detected) { // approx 0.75s of sustained volume
                detected = true;
                setMicStatus('success');
              }
            } else {
              if (sustainedFrames > 0) sustainedFrames--;
              if (sustainedFrames === 0 && !detected) {
                setAudioLevelDetected(false);
              }
            }
          }

          if (!detected) {
            rafRef.current = requestAnimationFrame(checkLevel);
          }
        };
        
        checkLevel();
      } catch (err) {
        console.error('Microphone error:', err);
        setMicStatus('error');
      }
    };

    checkAudioLevel();

    return () => {
      stopListening();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [currentStep, micStatus, globalStream, startListening, stopListening]);

  // If transcript matches the sentence, mark success (fallback to audio level)
  useEffect(() => {
    if (currentStep === 1 && transcript && micStatus === 'checking') {
      const lower = transcript.toLowerCase();
      if (lower.includes('hello') || lower.includes('ready') || lower.includes('start') || lower.includes('interview')) {
        setMicStatus('success');
      }
    }
  }, [transcript, currentStep, micStatus]);


  // ----------------------------------------------------
  // STEP 2: CAMERA
  // ----------------------------------------------------
  useEffect(() => {
    if (currentStep !== 2) return;
    setCamStatus('checking');

    if (globalStream) {
      // Confirm there is an actual live video track
      const hasLiveVideo = globalStream.getVideoTracks().some(track => track.readyState === 'live');
      if (hasLiveVideo) {
        setCamStatus('success');
      } else {
        setCamStatus('error');
      }
    } else {
      if (!streamInitializingRef.current) {
         setCamStatus('error');
      }
    }
  }, [currentStep, globalStream]);


  // ----------------------------------------------------
  // STEP 3: SYSTEM / BROWSER
  // ----------------------------------------------------
  useEffect(() => {
    if (currentStep !== 3) return;
    
    setNetStatus('checking');
    
    const checkSystem = async () => {
      if (!navigator.onLine) {
        setNetStatus('error');
        return;
      }
      try {
        // Quick ping to check actual reachability
        const start = performance.now();
        await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' }).catch(() => {});
        const duration = performance.now() - start;
        setNetStatus(duration > 2000 ? 'warning' : 'success');
      } catch {
        setNetStatus('warning'); // Default to warning if fetch fails but we're "online"
      }
    };
    
    checkSystem();
  }, [currentStep]);


  const handleContinue = () => {
    navigate(`${ROUTES.INTERVIEW_ACTIVE}?id=${sessionId}`);
  };

  const getStepClass = (step: Step) => {
    if (currentStep === step) return "border-brand-500 bg-brand-50 shadow-md text-brand-700";
    if (currentStep > step) return "border-green-200 bg-green-50 text-green-700";
    return "border-gray-200 bg-gray-50 text-gray-400";
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto w-screen min-h-screen flex flex-col font-sans">
      <Container className="py-8 md:py-16 max-w-4xl flex-1 flex flex-col justify-center mx-auto w-full">
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">System Check</h1>
        <p className="text-gray-500">Let's ensure your environment is ready for the AI interview.</p>
      </div>

      {/* Horizontal Wizard Progress (Responsive) */}
      <div className="hidden sm:flex items-center justify-between relative mb-12 max-w-2xl mx-auto w-full">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 rounded-full z-0 transition-all duration-500"
          style={{ width: currentStep === 1 ? '10%' : currentStep === 2 ? '40%' : currentStep === 3 ? '70%' : '100%' }}
        ></div>
        
        {/* Step 1: Mic */}
        <div className={`relative z-10 flex flex-col items-center transition-all duration-300 ${currentStep === 1 ? 'scale-110' : ''}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${getStepClass(1)} bg-white`}>
            {currentStep > 1 ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Mic className="w-6 h-6" />}
          </div>
          <span className={`mt-3 text-sm font-semibold ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Microphone</span>
        </div>

        {/* Step 2: Cam */}
        <div className={`relative z-10 flex flex-col items-center transition-all duration-300 ${currentStep === 2 ? 'scale-110' : ''}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${getStepClass(2)} bg-white`}>
            {currentStep > 2 ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Camera className="w-6 h-6" />}
          </div>
          <span className={`mt-3 text-sm font-semibold ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Camera</span>
        </div>

        {/* Step 3: Browser */}
        <div className={`relative z-10 flex flex-col items-center transition-all duration-300 ${currentStep === 3 ? 'scale-110' : ''}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${getStepClass(3)} bg-white`}>
            {currentStep > 3 ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Globe className="w-6 h-6" />}
          </div>
          <span className={`mt-3 text-sm font-semibold ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Browser</span>
        </div>

        {/* Step 4: Security */}
        <div className={`relative z-10 flex flex-col items-center transition-all duration-300 ${currentStep === 4 ? 'scale-110' : ''}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${getStepClass(4)} bg-white`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className={`mt-3 text-sm font-semibold ${currentStep === 4 ? 'text-gray-900' : 'text-gray-400'}`}>Security</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* ----------------- STEP 1 ----------------- */}
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 md:p-12 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mb-6">
                <Mic className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's test your microphone</h2>
              <p className="text-gray-500 mb-8 max-w-md">Please say this sentence clearly:</p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 w-full max-w-lg shadow-inner">
                <p className="text-xl font-medium text-slate-800 italic">"Hello, I am ready to start my interview."</p>
              </div>

              <div className="h-24 w-full max-w-xs mb-8 flex flex-col items-center justify-center">
                {micStatus === 'idle' ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-500 mb-2">We haven't detected your voice yet. Please click below and speak the sentence above.</p>
                    <Button onClick={() => setMicStatus('checking')} className="w-full">
                      Start Microphone Test
                    </Button>
                  </div>
                ) : micStatus === 'checking' ? (
                  <div className="flex flex-col items-center text-gray-400 w-full">
                    <AudioWaveform isListening={true} stream={globalStream} />
                    {audioLevelDetected && !transcript ? (
                      <span className="text-xs text-brand-500 mt-2 font-medium">Voice detected...</span>
                    ) : (
                      <span className="text-xs text-brand-500 mt-2 font-medium">Listening... Speak now</span>
                    )}
                  </div>
                ) : micStatus === 'error' ? (
                  <div className="text-red-500 flex items-center gap-2 font-medium">
                    <XCircle className="w-5 h-5" /> Microphone access denied
                  </div>
                ) : (
                  <div className="text-green-500 flex items-center gap-2 font-bold text-lg animate-in zoom-in">
                    <CheckCircle2 className="w-6 h-6" /> Microphone Verified
                  </div>
                )}
              </div>

              {transcript && (
                <div className="text-sm text-gray-500 mb-4 bg-gray-50 px-4 py-2 rounded-lg max-w-md w-full truncate">
                  Heard: "{transcript}"
                </div>
              )}

              {micStatus === 'error' && (
                <p className="text-sm text-red-500 mb-6 max-w-sm">
                  Microphone access was blocked. Please allow microphone access in your browser settings. You can continue using Type mode if unavailable.
                </p>
              )}

              <Button 
                size="lg" 
                onClick={() => setCurrentStep(2)}
                disabled={micStatus !== 'success'}
                className="min-w-[200px]"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ----------------- STEP 2 ----------------- */}
          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 md:p-12 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mb-6">
                <Camera className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Camera Check</h2>
              <p className="text-gray-500 mb-8">Position yourself so your face is clearly visible.</p>

              <div className="w-full max-w-md aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-8 relative border-4 border-slate-100 shadow-lg">
                {camStatus === 'checking' && (
                  <div className="absolute inset-0 flex items-center justify-center text-white flex-col">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span>Accessing camera...</span>
                  </div>
                )}
                {camStatus === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center text-red-400 flex-col bg-slate-800">
                    <XCircle className="w-10 h-10 mb-2" />
                    <span>Camera access denied</span>
                  </div>
                )}
                {globalStream && (
                  <video 
                    ref={handleVideoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    onLoadedMetadata={(e) => {
                      e.currentTarget.play().catch(() => {});
                    }}
                    className="w-full h-full object-cover -scale-x-100 bg-black/50"
                  />
                )}
                {camStatus === 'success' && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    Camera Ready
                  </div>
                )}
              </div>

              {camStatus === 'error' && (
                <p className="text-sm text-red-500 mb-6 max-w-sm">
                  Camera access was blocked. Please allow camera access in your browser settings to enable the AI interviewer to see you.
                </p>
              )}

              <Button 
                size="lg" 
                onClick={() => setCurrentStep(3)}
                disabled={camStatus === 'checking'}
                className="min-w-[200px]"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ----------------- STEP 3 ----------------- */}
          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 md:p-12 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mb-6">
                <Globe className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">System Readiness</h2>
              <p className="text-gray-500 mb-8">Finalizing browser compatibility and network checks.</p>

              <div className="w-full max-w-lg space-y-4 mb-8 text-left">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" /> Network Connection</span>
                  {netStatus === 'checking' ? <Loader2 className="w-5 h-5 animate-spin text-brand-500" /> 
                   : netStatus === 'success' ? <span className="text-green-500 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Optimal</span>
                   : netStatus === 'warning' ? <span className="text-amber-500 font-medium flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Unstable</span>
                   : <span className="text-red-500 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> Offline</span>}
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gray-400" /> Browser Compatibility</span>
                  {ttsSupported 
                    ? <span className="text-green-500 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Supported</span> 
                    : <span className="text-amber-500 font-medium text-xs text-right max-w-[150px]">Some voice features unavailable. Type mode available.</span>}
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-500" /> Security Monitoring</span>
                  <span className="text-green-500 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Ready</span>
                </div>
              </div>

              {netStatus !== 'checking' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-lg text-left bg-brand-50/50 p-6 rounded-2xl border border-brand-100 mb-8"
                >
                  <h3 className="font-bold text-brand-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-500" /> Terms & Consent
                  </h3>
                  
                  <label className="flex items-start gap-3 cursor-pointer group mb-4">
                    <input 
                      type="checkbox" 
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                      I consent to Interviu AI accessing my camera and microphone. I understand that my interview environment (tab switches, focus loss, clipboard usage) will be monitored for security purposes.
                    </span>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                      I have read and agree to the <button type="button" onClick={(e) => { e.preventDefault(); setShowTermsModal('terms'); }} className="text-brand-600 hover:underline font-medium">Terms of Service</button> and <button type="button" onClick={(e) => { e.preventDefault(); setShowTermsModal('privacy'); }} className="text-brand-600 hover:underline font-medium">Privacy Policy</button>.
                    </span>
                  </label>
                </motion.div>
              )}

              <Button 
                size="lg" 
                onClick={handleContinue}
                disabled={netStatus === 'checking' || !consentGiven || !agreedTerms}
                className="min-w-[200px]"
              >
                Enter Interview Room <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      </Container>

      {/* Terms & Privacy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {showTermsModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h3>
              <button onClick={() => setShowTermsModal(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-sm text-gray-600 space-y-4">
              <p>
                By proceeding with this AI interview, you acknowledge that your audio and video data will be processed in real-time to facilitate the interview experience.
              </p>
              <p>
                We do not permanently store your raw video or audio streams. The processed text transcripts and AI evaluations are saved to provide you with your final report and score.
              </p>
              <p>
                Please ensure you are in a quiet, well-lit environment and that you are the only person visible in the camera frame.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <Button onClick={() => setShowTermsModal(null)}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}