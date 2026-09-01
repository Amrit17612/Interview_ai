import { useRef, useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { CameraOff, GripHorizontal, EyeOff, Eye, Camera } from 'lucide-react';
import { streamCache } from '../utils/streamCache';

interface FloatingCameraProps {}

export function FloatingCamera(_props: FloatingCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [error, setError] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const dragControls = useDragControls();

  const [constraints, setConstraints] = useState({ left: -1000, top: -1000, right: 0, bottom: 0 });

  useEffect(() => {
    // Calculate rough viewport bounds for dragging from the bottom-right corner
    const updateConstraints = () => {
      setConstraints({
        left: -window.innerWidth + (window.innerWidth < 768 ? 150 : 250),
        top: -window.innerHeight + (window.innerWidth < 768 ? 200 : 300),
        right: 20,
        bottom: 20
      });
    };
    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        if (streamCache.cameraStream && streamCache.cameraStream.active) {
          localStream = streamCache.cameraStream;
        } else {
          localStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamCache.setCameraStream(localStream);
        }
        
        setError(false);
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      } catch (err) {
        console.error('Failed to access camera in FloatingCamera:', err);
        setError(true);
      }
    };

    startCamera();

    return () => {
      // If we used the cached stream, DO NOT stop it here, ActiveInterview will stop it on unmount.
      // Actually, FloatingCamera lives in ActiveInterview, so it's okay to clean up here on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        streamCache.clearCameraStream();
      }
    };
  }, []);

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={constraints}
      className={`fixed z-50 bottom-6 right-6 md:bottom-12 md:right-12 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 flex flex-col group touch-none transition-all duration-300 ${
        isHidden ? 'w-32 h-12' : 'w-32 h-44 md:w-56 md:h-72'
      }`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
    >
      <div 
        className="w-full h-8 bg-slate-900/80 absolute top-0 left-0 z-20 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripHorizontal className="w-4 h-4 text-slate-400" />
        <button 
          onClick={() => setIsHidden(!isHidden)}
          className="text-slate-400 hover:text-white p-1"
          aria-label={isHidden ? "Show camera" : "Hide camera"}
        >
          {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>
      
      {isHidden ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-800 pt-8 pb-2 px-3 gap-2">
          <Camera className="w-4 h-4 text-green-400" />
          <span className="text-xs font-medium">On</span>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-800">
          <CameraOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs">Camera Off</span>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover -scale-x-100 absolute inset-0 z-0"
          />
          <div className="absolute bottom-2 left-2 z-10 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-medium text-white shadow-sm border border-white/10">
            You
          </div>
        </>
      )}
    </motion.div>
  );
}
