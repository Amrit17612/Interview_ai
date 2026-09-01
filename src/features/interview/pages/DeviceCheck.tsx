import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import { 
  Camera, 
  Mic, 
  Wifi, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

type CheckStatus = 'idle' | 'checking' | 'success' | 'error' | 'warning';

export function DeviceCheck() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id');

  const [camStatus, setCamStatus] = useState<CheckStatus>('idle');
  const [micStatus, setMicStatus] = useState<CheckStatus>('idle');
  const [netStatus, setNetStatus] = useState<CheckStatus>('idle');
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [consentGiven, setConsentGiven] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      navigate(ROUTES.INTERVIEW);
    }
  }, [sessionId, navigate]);

  // Network Check
  useEffect(() => {
    const checkNetwork = async () => {
      setNetStatus('checking');
      if (!navigator.onLine) {
        setNetStatus('error');
        return;
      }
      try {
        // Simple ping to a reliable endpoint
        const start = performance.now();
        await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' }).catch(() => {});
        const end = performance.now();
        if (end - start > 1500) {
          setNetStatus('warning');
        } else {
          setNetStatus('success');
        }
      } catch {
        setNetStatus('warning');
      }
    };
    checkNetwork();
  }, []);

  // Hardware Check
  useEffect(() => {
    let localStream: MediaStream | null = null;
    
    const checkHardware = async () => {
      setCamStatus('checking');
      setMicStatus('checking');
      
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(localStream);
        setCamStatus('success');
        setMicStatus('success');
      } catch (err: any) {
        console.error('Device access error:', err);
        if (err.name === 'NotAllowedError') {
          setCamStatus('error');
          setMicStatus('error');
        } else if (err.name === 'NotFoundError') {
          // Check them individually if one fails
          try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            setCamStatus('success');
          } catch {
            setCamStatus('error');
          }
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicStatus('success');
          } catch {
            setMicStatus('error');
          }
        } else {
          setCamStatus('error');
          setMicStatus('error');
        }
      }
    };

    checkHardware();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleContinue = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    navigate(`${ROUTES.INTERVIEW_ACTIVE}?id=${sessionId}`);
  };

  const StatusIcon = ({ status }: { status: CheckStatus }) => {
    switch(status) {
      case 'idle': return <div className="w-5 h-5 rounded-full border-2 border-gray-200" />;
      case 'checking': return <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (type: string, status: CheckStatus) => {
    if (status === 'checking') return `Checking ${type}...`;
    if (status === 'success') return `${type} Ready`;
    if (status === 'warning') return `${type} Unstable`;
    if (status === 'error') return `${type} Access Required / Unavailable`;
    return `Waiting to check ${type}`;
  };

  const allChecksDone = camStatus !== 'idle' && camStatus !== 'checking' && 
                        micStatus !== 'idle' && micStatus !== 'checking' && 
                        netStatus !== 'idle' && netStatus !== 'checking';

  const canContinue = allChecksDone && consentGiven && agreedTerms;

  return (
    <Container className="py-12 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Preparing your interview</h1>
          <p className="text-gray-500 text-sm">Let's make sure everything is working perfectly before you start.</p>
        </div>

        <div className="p-8 space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <StatusIcon status={camStatus} />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-gray-500" /> Camera
                </div>
                <div className="text-sm text-gray-500">{getStatusText('Camera', camStatus)}</div>
              </div>
              {camStatus === 'error' && (
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Please enable in browser settings</div>
              )}
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <StatusIcon status={micStatus} />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-gray-500" /> Microphone
                </div>
                <div className="text-sm text-gray-500">{getStatusText('Microphone', micStatus)}</div>
              </div>
              {micStatus === 'error' && (
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Please enable in browser settings</div>
              )}
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <StatusIcon status={netStatus} />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-gray-500" /> Network
                </div>
                <div className="text-sm text-gray-500">{getStatusText('Connection', netStatus)}</div>
              </div>
            </div>
          </div>

          {(camStatus === 'error' || micStatus === 'error') && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm">
              <strong className="block mb-1">Hardware not detected or permission denied.</strong>
              You can still proceed, but you may need to use 'Type' mode to answer questions if your microphone is unavailable.
            </div>
          )}

          {allChecksDone && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6 border-t border-gray-100 space-y-4"
            >
              <h3 className="font-bold text-gray-900">Before we begin</h3>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  I consent to Interviu AI accessing my camera and microphone for the duration of this interview. Video and audio are processed locally in your browser and are not permanently recorded or stored.
                </span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  I agree to the <a href={ROUTES.TERMS} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Terms of Service</a> and <a href={ROUTES.PRIVACY_POLICY} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Privacy Policy</a>.
                </span>
              </label>

              <div className="pt-4 flex justify-end">
                <Button 
                  size="lg" 
                  disabled={!canContinue}
                  onClick={handleContinue}
                  className="w-full sm:w-auto px-8"
                >
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </Container>
  );
}