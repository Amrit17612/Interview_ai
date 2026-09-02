import { useEffect, useRef, useState, useCallback } from 'react';
import { apiClient } from '../../../services/api.client';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

export type SecuritySeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';
export type SecurityEventType = 
  | 'TAB_SWITCH' | 'FOCUS_LOST' | 'FOCUS_REGAINED' 
  | 'COPY_ATTEMPT' | 'CUT_ATTEMPT' | 'PASTE_ATTEMPT' 
  | 'RIGHT_CLICK' | 'DRAG_DROP_ATTEMPT'
  | 'NO_FACE' | 'MULTIPLE_FACES' | 'SCREEN_SHARE_STOPPED';

interface SecurityEvent {
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: string;
  metadata?: any;
}

export function useSecurityMonitor(sessionId: string | null, isActive: boolean, videoRef?: React.RefObject<HTMLVideoElement | null>) {
  const [warnings, setWarnings] = useState<SecurityEvent[]>([]);
  const eventQueue = useRef<SecurityEvent[]>([]);
  const lastSyncTime = useRef<number>(Date.now());
  const faceCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const consecutiveNoFace = useRef(0);
  const consecutiveMultipleFaces = useRef(0);

  const addEvent = useCallback((type: SecurityEventType, severity: SecuritySeverity, metadata?: any) => {
    if (!isActive) return;

    const event: SecurityEvent = {
      type,
      severity,
      timestamp: new Date().toISOString(),
      metadata
    };

    eventQueue.current.push(event);

    if (['LOW', 'MEDIUM', 'HIGH'].includes(severity)) {
      setWarnings(prev => [...prev, event]);
    }

    // Flush if queue gets too large or 30s elapsed
    if (eventQueue.current.length >= 10 || Date.now() - lastSyncTime.current > 30000) {
      flushEvents();
    }
  }, [isActive]);

  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0 || !sessionId) return;
    
    const eventsToSend = [...eventQueue.current];
    eventQueue.current = [];
    lastSyncTime.current = Date.now();

    try {
      await apiClient.post('/security/events', {
        sessionId,
        events: eventsToSend
      });
    } catch (err) {
      console.error('[Security] Failed to sync events, pushing back to queue', err);
      // Optional: push back to queue, but cap it to avoid memory leaks
      eventQueue.current = [...eventsToSend, ...eventQueue.current].slice(0, 50);
    }
  }, [sessionId]);

  // Expose an explicit flush for component unmount / completion
  const flushPendingEvents = useCallback(async () => {
    if (eventQueue.current.length > 0 && sessionId) {
      await flushEvents();
    }
  }, [sessionId, flushEvents]);

  // Event Listeners
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addEvent('TAB_SWITCH', 'MEDIUM');
      } else {
        addEvent('FOCUS_REGAINED', 'INFO');
      }
    };

    const handleBlur = () => {
      // Prevent double counting if visibility change also fired
      if (!document.hidden) {
        addEvent('FOCUS_LOST', 'MEDIUM');
      }
    };

    const handleFocus = () => {
      addEvent('FOCUS_REGAINED', 'INFO');
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addEvent('COPY_ATTEMPT', 'MEDIUM');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      addEvent('CUT_ATTEMPT', 'MEDIUM');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addEvent('PASTE_ATTEMPT', 'MEDIUM');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addEvent('RIGHT_CLICK', 'LOW');
    };
    
    const handleDragDrop = (e: DragEvent) => {
      e.preventDefault();
      addEvent('DRAG_DROP_ATTEMPT', 'LOW');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl) {
        switch (e.key.toLowerCase()) {
          case 'c': addEvent('COPY_ATTEMPT', 'MEDIUM'); e.preventDefault(); break;
          case 'x': addEvent('CUT_ATTEMPT', 'MEDIUM'); e.preventDefault(); break;
          case 'v': addEvent('PASTE_ATTEMPT', 'MEDIUM'); e.preventDefault(); break;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('drop', handleDragDrop);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('drop', handleDragDrop);
      document.removeEventListener('keydown', handleKeyDown);
      flushEvents(); // Attempt to flush on unmount
    };
  }, [isActive, addEvent, flushEvents]);

  // Face Detection Polling via MediaPipe
  useEffect(() => {
    if (!isActive || !videoRef?.current) return;

    let detector: FaceDetector | null = null;
    let isActivePolling = true;

    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU"
          },
          runningMode: "VIDEO"
        });
      } catch (err) {
        console.warn('[Security] MediaPipe FaceDetector initialization failed:', err);
      }
    };

    initMediaPipe();

    faceCheckInterval.current = setInterval(async () => {
      if (!detector || !isActivePolling) return;
      if (videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
        try {
          const startTimeMs = performance.now();
          const results = detector.detectForVideo(videoRef.current, startTimeMs);
          const numFaces = results.detections.length;
          
          if (numFaces === 0) {
            consecutiveNoFace.current++;
            consecutiveMultipleFaces.current = 0;
            if (consecutiveNoFace.current === 6) { // ~3 seconds debounce (2 FPS => 6 frames)
              addEvent('NO_FACE', 'HIGH');
            }
          } else if (numFaces > 1) {
            consecutiveMultipleFaces.current++;
            consecutiveNoFace.current = 0;
            if (consecutiveMultipleFaces.current === 6) { 
              addEvent('MULTIPLE_FACES', 'HIGH');
            }
          } else {
            // Normal (1 face)
            consecutiveNoFace.current = 0;
            consecutiveMultipleFaces.current = 0;
          }
        } catch (err) {
          console.warn('[Security] MediaPipe Face detection error:', err);
        }
      }
    }, 500); // 2 FPS

    return () => {
      isActivePolling = false;
      if (faceCheckInterval.current) clearInterval(faceCheckInterval.current);
      if (detector) {
        detector.close();
      }
    };
  }, [isActive, videoRef, addEvent]);

  // Sync timer fallback (every 30s)
  useEffect(() => {
    if (!isActive) return;
    
    const syncTimer = setInterval(() => {
      flushEvents();
    }, 30000);

    return () => clearInterval(syncTimer);
  }, [isActive, flushEvents]);

  return { warnings, flushPendingEvents };
}
