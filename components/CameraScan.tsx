
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
        alert("Unable to access camera. Please ensure permissions are granted.");
        onCancel();
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImages([...capturedImages, imageData]);
      }
    }
  };

  const removePhoto = (index: number) => {
    setCapturedImages(capturedImages.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`} 
        />
        
        {/* Overlay Overlay */}
        <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40">
          <div className="w-full h-full border-2 border-white/40 rounded-lg relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium">
              Align letter within frame
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Gallery strip */}
      <div className={`bg-black/90 p-4 transition-all duration-300 overflow-x-auto flex gap-3 ${capturedImages.length > 0 ? 'h-32 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
        {capturedImages.map((img, idx) => (
          <div key={idx} className="relative w-20 h-24 flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden border border-white/20">
            <img src={img} className="w-full h-full object-cover" />
            <button 
              onClick={() => removePhoto(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-1 left-1 bg-black/60 text-[10px] px-1 rounded text-white font-bold">
              Pg {idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="p-8 bg-black flex justify-between items-center text-white">
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button 
          onClick={takePhoto}
          className="w-20 h-20 bg-white rounded-full p-1 border-4 border-white/30 active:scale-90 transition-transform flex items-center justify-center shadow-xl shadow-white/5"
        >
          <div className="w-full h-full bg-white rounded-full border border-slate-200" />
        </button>

        <div className="w-12 flex justify-end">
          {capturedImages.length > 0 && (
            <button 
              onClick={() => onComplete(capturedImages)}
              className="bg-blue-600 px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 active:scale-95 transition-all"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraScan;
