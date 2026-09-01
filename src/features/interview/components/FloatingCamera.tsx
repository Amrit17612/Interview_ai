import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CameraOff, GripHorizontal, EyeOff, Eye, Camera, Maximize2, Minimize2 } from 'lucide-react';
import { streamCache } from '../utils/streamCache';

export function FloatingCamera() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [error, setError] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Dynamic drag constraints based on window resize
  const [constraints, setConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Allow moving freely within the screen, keeping it on screen.
        // Assuming default placement is top-right, right: 0 and top: 0
        // The container uses layout positioned from top-right.
        setConstraints({
          left: -(window.innerWidth - width - 32), // 32px padding margin
          right: 0,
          top: 0,
          bottom: window.innerHeight - height - 32
        });
      }
    };
    
    // Initial calculate after a tiny delay to allow layout to settle
    setTimeout(updateConstraints, 100);
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, [isExpanded, isHidden]); // recalculate if size changes

  useEffect(() => {
    let localStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        if (streamCache.cameraStream && streamCache.cameraStream.active) {
          localStream = streamCache.cameraStream;
        } else {
          localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamCache.setCameraStream(localStream);
        }
        
        setError(false);
        if (videoRef.current && localStream) {
          videoRef.current.srcObject = localStream;
          // Explicitly play to prevent blank camera issue
          videoRef.current.play().catch(e => {
            console.error("Camera playback failed:", e);
            // Safari/iOS may require muted autoPlay
          });
        }
      } catch (err) {
        console.error('Failed to access camera in FloatingCamera:', err);
        setError(true);
      }
    };

    startCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        streamCache.clearCameraStream();
      }
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      drag
      dragConstraints={constraints}
      dragElastic={0.1}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed top-4 right-4 z-[200] shadow-2xl rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 flex flex-col ${
        isHidden ? 'w-48 h-16' : (isExpanded ? 'w-[280px] sm:w-[360px] aspect-[4/3]' : 'w-[160px] sm:w-[220px] aspect-[4/3]')
      }`}
      style={{ touchAction: 'none' }}
    >
      
      {/* Top Header / Drag Handle */}
      <div className="h-8 bg-slate-800/80 backdrop-blur flex items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b border-slate-700/50 group shrink-0">
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase hidden sm:block">You</span>
        </div>
        
        <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
          {!isHidden && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white p-1"
              aria-label={isExpanded ? "Shrink camera" : "Expand camera"}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
          <button 
            onClick={() => setIsHidden(!isHidden)}
            className="text-slate-400 hover:text-white p-1"
            aria-label={isHidden ? "Show camera" : "Hide camera"}
          >
            {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
        {isHidden ? (
          <div className="flex items-center justify-center gap-2 text-slate-400 w-full h-full text-sm font-medium">
            <Camera className="w-4 h-4" /> Camera Hidden
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-slate-500 p-4 text-center">
            <CameraOff className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs">Camera unavailable</span>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
            {/* Live Recording Indicator */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-medium text-white tracking-widest">LIVE</span>
            </div>
          </>
        )}
      </div>

    </motion.div>
  );
}
