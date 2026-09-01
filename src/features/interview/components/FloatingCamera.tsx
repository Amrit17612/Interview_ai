import { useRef, useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { CameraOff, GripHorizontal } from 'lucide-react';

interface FloatingCameraProps {
}

export function FloatingCamera(_props: FloatingCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [error, setError] = useState<boolean>(false);
  const dragControls = useDragControls();

  useEffect(() => {
    let localStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true });
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
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
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
      className="fixed z-50 bottom-6 right-6 md:bottom-12 md:right-12 w-32 h-40 md:w-48 md:h-64 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 flex flex-col group touch-none"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
    >
      <div 
        className="w-full h-8 bg-slate-900/80 absolute top-0 left-0 z-10 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripHorizontal className="w-4 h-4 text-slate-400" />
      </div>
      
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-800">
          <CameraOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs">Camera Off</span>
        </div>
      ) : (
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover -scale-x-100"
        />
      )}
    </motion.div>
  );
}
