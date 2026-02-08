
import React, { useRef, useState, useEffect } from 'react';

interface CameraScanProps {
  onCancel: () => void;
  onComplete: (images: string[]) => void;
}

const CameraScan: React.FC<CameraScanProps> = ({ onCancel, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, 
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        onCancel();
      }
    }
    startCamera();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const MAX_DIM = 1024; // Balanced resolution for speed vs quality
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
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImages([...capturedImages, imageData]);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`} 
        />
        <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40">
          <div className="w-full h-full border-2 border-white/40 rounded-lg relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              Position Document
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className={`bg-black/90 p-4 transition-all duration-300 overflow-x-auto flex gap-3 ${capturedImages.length > 0 ? 'h-32 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
        {capturedImages.map((img, idx) => (
          <div key={idx} className="relative w-20 h-24 flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden border border-white/20">
            <img src={img} className="w-full h-full object-cover" />
            <button onClick={() => setCapturedImages(capturedImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        ))}
      </div>

      <div className="p-8 bg-black flex justify-between items-center text-white pb-12">
        <button onClick={onCancel} className="text-sm font-bold text-slate-400">Cancel</button>
        <button onClick={takePhoto} className="w-16 h-16 bg-white rounded-full p-1 border-4 border-white/30 active:scale-90 transition-transform"><div className="w-full h-full bg-white rounded-full border border-slate-200" /></button>
        <button onClick={() => onComplete(capturedImages)} disabled={capturedImages.length === 0} className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${capturedImages.length > 0 ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>Analyze ({capturedImages.length})</button>
      </div>
    </div>
  );
};

export default CameraScan;
