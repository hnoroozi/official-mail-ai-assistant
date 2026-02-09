
import React, { useRef, useState, useEffect, useCallback } from 'react';

interface CameraScanProps {
  onCancel: () => void;
  onComplete: (images: string[]) => void;
}

const CameraScan: React.FC<CameraScanProps> = ({ onCancel, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isstartingRef = useRef(false);
  
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Force the video element to reset
    }
    setIsCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (isstartingRef.current) return;
    isstartingRef.current = true;

    // Aggressive cleanup before start
    stopCamera();
    
    // Small pause to let the hardware 'breathe'
    await new Promise(resolve => setTimeout(resolve, 500));

    const constraints = [
      { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
      { video: { facingMode: { exact: 'environment' } }, audio: false },
      { video: { facingMode: 'environment' }, audio: false },
      { video: true, audio: false }
    ];

    let lastError: any = null;

    for (const config of constraints) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(config);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          streamRef.current = mediaStream;
          
          // Wait for metadata to be sure it's actually streaming
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = resolve;
            } else resolve(null);
          });

          setIsCameraReady(true);
          setError(null);
          isstartingRef.current = false;
          return;
        }
      } catch (err: any) {
        console.warn("Camera config failed:", config, err);
        lastError = err;
        // If it's a permission error, don't keep trying other configs
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') break;
      }
    }

    if (lastError) {
      if (lastError.name === 'NotAllowedError' || lastError.name === 'PermissionDeniedError') {
        setError("Camera access denied. Please allow camera permissions in your browser settings.");
      } else if (lastError.name === 'NotReadableError' || lastError.name === 'TrackStartError' || lastError.message?.includes('use')) {
        setError("Camera is locked by another app or a ghost process. Please close all other tabs and apps, then try again.");
      } else if (lastError.name === 'NotFoundError') {
        setError("No rear camera detected on this device.");
      } else {
        setError(`Camera Error: ${lastError.message || "Unknown hardware failure"}`);
      }
    }
    isstartingRef.current = false;
  }, [stopCamera]);

  useEffect(() => {
    startCamera();

    // Re-init camera if user comes back to the tab (fixes mobile freeze)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startCamera();
      } else {
        stopCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const MAX_DIM = 1280;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > height) {
        if (width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImages(prev => [...prev, imageData]);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="p-8 text-center animate-in fade-in zoom-in duration-500 max-w-sm">
            <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-black mb-3">Camera Unavailable</h3>
            <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
              {error}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => startCamera()}
                className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg"
              >
                Retry Camera
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
              >
                Upload Photo Instead
              </button>
              <button 
                onClick={onCancel}
                className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover transition-opacity duration-700 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`} 
            />
            {isCameraReady && (
              <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40">
                <div className="w-full h-full border-2 border-white/30 rounded-3xl relative">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                    Align Document Clearly
                  </div>
                </div>
              </div>
            )}
            {!isCameraReady && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Waking Camera...</span>
              </div>
            )}
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept="image/*" 
          multiple 
        />
      </div>

      {capturedImages.length > 0 && (
        <div className="bg-black/95 p-4 transition-all duration-300 overflow-x-auto flex gap-3 h-32 border-t border-white/5">
          {capturedImages.map((img, idx) => (
            <div key={idx} className="relative w-20 h-24 flex-shrink-0 bg-slate-900 rounded-xl overflow-hidden border border-white/10 group">
              <img src={img} className="w-full h-full object-cover" alt={`Page ${idx + 1}`} />
              <button 
                onClick={() => setCapturedImages(capturedImages.filter((_, i) => i !== idx))} 
                className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-lg active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-8 bg-black flex justify-between items-center text-white pb-14 border-t border-white/5">
        <button onClick={onCancel} className="text-sm font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Cancel</button>
        
        {!error && (
          <button 
            onClick={takePhoto} 
            disabled={!isCameraReady}
            className={`w-20 h-20 rounded-full p-1.5 border-4 border-white/20 active:scale-90 transition-all shadow-2xl ${isCameraReady ? 'bg-white' : 'bg-slate-800 opacity-20'}`}
          >
            <div className="w-full h-full bg-white rounded-full border-2 border-slate-200 shadow-inner" />
          </button>
        )}

        <button 
          onClick={() => {
            stopCamera();
            onComplete(capturedImages);
          }} 
          disabled={capturedImages.length === 0} 
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            capturedImages.length > 0 
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/40' 
              : 'bg-slate-900 text-slate-700 border border-white/5'
          }`}
        >
          Done ({capturedImages.length})
        </button>
      </div>
    </div>
  );
};

export default CameraScan;
