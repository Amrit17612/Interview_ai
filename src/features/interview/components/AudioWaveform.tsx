import { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isListening: boolean;
}

export function AudioWaveform({ isListening }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;

    const initAudio = async () => {
      if (!isListening) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        
        streamRef.current = stream;
        
        // Initialize Web Audio API
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
          if (!mounted) return;
          animationRef.current = requestAnimationFrame(draw);

          analyserRef.current!.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;

          // Draw a sleek, center-aligned symmetric waveform
          const centerY = canvas.height / 2;

          for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * (canvas.height / 2);
            
            // Avoid drawing empty bars to keep it clean
            if (barHeight < 2) barHeight = 2;

            // Brand color gradient
            const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
            gradient.addColorStop(0, '#38bdf8'); // sky-400
            gradient.addColorStop(1, '#818cf8'); // indigo-400

            ctx.fillStyle = gradient;
            
            // Draw top half
            ctx.beginPath();
            ctx.roundRect(x, centerY - barHeight, barWidth - 1, barHeight, 4);
            ctx.fill();
            
            // Draw bottom half (reflection)
            ctx.beginPath();
            ctx.roundRect(x, centerY, barWidth - 1, barHeight, 4);
            ctx.fill();

            x += barWidth + 2;
          }
        };

        draw();

      } catch (err) {
        console.error('Error initializing audio waveform:', err);
      }
    };

    if (isListening) {
      initAudio();
    }

    return () => {
      mounted = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (analyserRef.current) analyserRef.current.disconnect();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [isListening]);

  return (
    <div className="w-full h-24 flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden relative">
      {!isListening && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
          Microphone inactive
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={80} 
        className={`w-full h-full max-w-sm transition-opacity duration-300 ${isListening ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
