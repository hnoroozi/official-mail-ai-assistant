
import React, { useEffect, useState } from 'react';
import { LetterAnalysis, SupportedLanguage } from '../types.ts';
import { analyzeLetter } from '../services/geminiService.ts';

interface ProcessingProps {
  images: string[];
  targetLanguage: SupportedLanguage;
  onComplete: (analysis: LetterAnalysis) => void;
  onError: () => void;
}

const Processing: React.FC<ProcessingProps> = ({ images, targetLanguage, onComplete, onError }) => {
  const [progress, setProgress] = useState(0);
  const [errorDetails, setErrorDetails] = useState<{ message: string; code?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 2 : prev));
    }, 200);

    async function process() {
      try {
        const analysis = await analyzeLetter(images, targetLanguage);
        if (isMounted) {
          setProgress(100);
          setTimeout(() => onComplete(analysis), 500);
        }
      } catch (err: any) {
        if (!isMounted) return;
        clearInterval(interval);
        console.error("Processing error:", err);
        setErrorDetails({
          message: err.message || "An unexpected error occurred during analysis.",
          code: err.name
        });
      }
    }

    process();
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [images, targetLanguage, onComplete]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-white text-center">
      {!errorDetails ? (
        <div className="animate-in fade-in duration-700 w-full max-w-xs">
          <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white mb-10 mx-auto shadow-2xl shadow-indigo-200 animate-pulse">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Analyzing...</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-12">Extracting critical data</p>
          
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
             <div 
               className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
               style={{ width: `${progress}%` }} 
             />
          </div>
        </div>
      ) : (
        <div className="animate-in zoom-in duration-300 max-w-sm w-full">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Analysis Failed</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed px-4">
            {errorDetails.message}
          </p>
          
          {errorDetails.message.includes("MISSING_API_KEY") && (
            <div className="bg-amber-50 p-4 rounded-2xl mb-8 text-xs text-amber-700 text-left border border-amber-100 leading-relaxed">
              <strong>Tip:</strong> Log in to your Netlify dashboard, go to <b>Site settings > Environment variables</b>, and add <code>API_KEY</code> with your Gemini API key. Then redeploy your site.
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
            >
              Try Again
            </button>
            <button 
              onClick={onError} 
              className="py-4 text-slate-400 font-bold text-xs uppercase tracking-widest"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Processing;
