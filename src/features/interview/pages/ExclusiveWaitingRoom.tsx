import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import { apiClient } from '../../../services/api.client';

export function ExclusiveWaitingRoom() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const [state, setState] = useState<{ token: string; schedule: any; serverTime: number; template: any; batchName: string } | null>(null);

  useEffect(() => {
    // Load state from sessionStorage
    const storedState = sessionStorage.getItem('waitingRoomState');
    if (!storedState) {
      navigate(ROUTES.EXCLUSIVE_INTERVIEWS);
      return;
    }
    
    try {
      const parsed = JSON.parse(storedState);
      if (!parsed.token || !parsed.schedule || !parsed.schedule.loginStartAt) {
        navigate(ROUTES.EXCLUSIVE_INTERVIEWS);
        return;
      }
      setState(parsed);
    } catch (e) {
      navigate(ROUTES.EXCLUSIVE_INTERVIEWS);
    }
  }, [navigate]);

  useEffect(() => {
    if (!state) return;

    // Calculate initial server offset
    const clientTimeNow = Date.now();
    const serverOffset = state.serverTime - clientTimeNow;
    const loginStartAtMs = new Date(state.schedule.loginStartAt).getTime();

    const timer = setInterval(() => {
      const effectiveNow = Date.now() + serverOffset;
      const remainingMs = loginStartAtMs - effectiveNow;

      if (remainingMs <= 0) {
        clearInterval(timer);
        setTimeLeft(null);
        handleZeroReached();
      } else {
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state]);

  const handleZeroReached = async () => {
    if (!state) return;
    setIsVerifying(true);
    try {
      const res = await apiClient.post<any>('/interview-templates/validate-token', { token: state.token });
      if (res.data.success) {
        setIsReady(true);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Access expired or invalid.';
      setError(msg);
      // Wait a moment then redirect back
      setTimeout(() => navigate(ROUTES.EXCLUSIVE_INTERVIEWS), 3000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStart = async () => {
    if (!state) return;
    try {
      setIsVerifying(true);
      const res = await apiClient.post(`/interview-templates/${state.template._id}/start`, { token: state.token });
      if (res.data.success) {
        sessionStorage.removeItem('waitingRoomState');
        try {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch (err) {}
        navigate(`${ROUTES.INTERVIEW_DEVICE_CHECK}?id=${res.data.data.sessionId}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to start interview.';
      setError(msg);
      setIsVerifying(false);
    }
  };

  if (!state) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-brand-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-90 animate-pulse" />
            <h1 className="text-2xl font-bold mb-2">Your interview is scheduled to start soon</h1>
            <p className="text-brand-100">{state.batchName || 'Exclusive Batch'}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 text-center space-y-8">
          
          {error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 mr-2" />
              {error}
            </div>
          ) : isReady ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">It's time!</h2>
              <p className="text-gray-600">Your interview is ready to begin.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600">Your interview access is verified. Please stay on this page until your interview starts.</p>
              
              {timeLeft && (
                <div className="flex justify-center items-center space-x-4 mb-8">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-mono font-bold text-gray-900 bg-gray-100 px-4 py-3 rounded-xl shadow-inner min-w-[80px]">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-gray-500 font-medium uppercase mt-2">Hours</span>
                  </div>
                  <span className="text-3xl font-bold text-gray-300 pb-6">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-mono font-bold text-gray-900 bg-gray-100 px-4 py-3 rounded-xl shadow-inner min-w-[80px]">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-gray-500 font-medium uppercase mt-2">Minutes</span>
                  </div>
                  <span className="text-3xl font-bold text-gray-300 pb-6">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-mono font-bold text-gray-900 bg-gray-100 px-4 py-3 rounded-xl shadow-inner min-w-[80px]">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-gray-500 font-medium uppercase mt-2">Seconds</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 text-left space-y-2 border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-2">Preparation Hints:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Camera and microphone will be checked next.</li>
              <li>Keep a stable internet connection.</li>
              <li>Stay on this page until the interview begins.</li>
            </ul>
          </div>

          <Button 
            className="w-full h-12 text-lg" 
            disabled={!isReady || isVerifying || !!error}
            onClick={handleStart}
          >
            {isVerifying ? 'Verifying...' : 'Continue to Device Check'}
          </Button>
          
        </div>
      </div>
    </div>
  );
}
