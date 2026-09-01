
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

export type InterviewStatus = 'IDLE' | 'AI_SPEAKING' | 'LISTENING' | 'ANALYZING' | 'READY_FOR_ANSWER';

interface AIAvatarProps {
  status: InterviewStatus;
}

export function AIAvatar({ status }: AIAvatarProps) {
  
  // Define animation states based on status
  const getAvatarAnimation = () => {
    switch (status) {
      case 'AI_SPEAKING':
        return {
          scale: [1, 1.05, 1],
          boxShadow: [
            "0px 0px 0px rgba(56, 189, 248, 0)",
            "0px 0px 40px rgba(56, 189, 248, 0.4)",
            "0px 0px 0px rgba(56, 189, 248, 0)"
          ],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
        };
      case 'LISTENING':
        return {
          scale: 1,
          boxShadow: "0px 0px 20px rgba(34, 197, 94, 0.3)",
          transition: { duration: 0.5 }
        };
      case 'ANALYZING':
        return {
          scale: 1,
          boxShadow: "0px 0px 20px rgba(168, 85, 247, 0.3)",
          transition: { duration: 0.5 }
        };
      default:
        return {
          scale: 1,
          boxShadow: "0px 0px 0px rgba(0,0,0,0)",
          transition: { duration: 0.5 }
        };
    }
  };

  const getRingColor = () => {
    switch (status) {
      case 'AI_SPEAKING': return 'border-sky-400/50';
      case 'LISTENING': return 'border-green-400/50';
      case 'ANALYZING': return 'border-purple-400/50';
      default: return 'border-slate-700';
    }
  };

  return (
    <div className="relative flex items-center justify-center w-32 h-32 md:w-48 md:h-48">
      {/* Outer pulsing ring for analyzing state */}
      <AnimatePresence>
        {status === 'ANALYZING' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2, rotate: 360 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/30"
          />
        )}
      </AnimatePresence>

      <motion.div 
        animate={getAvatarAnimation()}
        className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-800 border-2 ${getRingColor()} flex items-center justify-center overflow-hidden z-10 transition-colors duration-500`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-700" />
        <BrainCircuit className={`w-10 h-10 md:w-12 md:h-12 relative z-10 ${status === 'AI_SPEAKING' ? 'text-sky-400' : 'text-slate-300'} transition-colors duration-500`} />
        
        {/* Inner glow */}
        <div className={`absolute inset-0 opacity-20 ${status === 'AI_SPEAKING' ? 'bg-sky-400' : status === 'LISTENING' ? 'bg-green-400' : status === 'ANALYZING' ? 'bg-purple-400' : 'bg-transparent'} transition-colors duration-500 mix-blend-overlay`} />
      </motion.div>
    </div>
  );
}
