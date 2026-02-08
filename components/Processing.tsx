
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
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Enhancing document clarity...",
    "Extracting key text elements...",
    "Interpreting official language...",
    "Generating your actionable summary..."
  ];

  useEffect(() => {
    let isMounted = true;

    async function process() {
      try {
        const minTime = 4000;
        const startTime = Date.now();
        
        const analysis = await analyzeLetter(images, targetLanguage);
        
        const elapsed = Date.now() - startTime;
        const wait = Math.max(0, minTime - elapsed);
        
        setTimeout(() => {
          if (isMounted) onComplete(analysis);
        }, wait);

      } catch (err) {
        console.error(err);
        alert("Failed to analyze the letter. Please try again.");
        if (isMounted) onError();
      }
    }

    process();

    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 1));
    }, 40);

    const stepInterval = setInterval(() => {
      setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-white text-center">
      <div className="relative w-40 h-40 mb-10">
        <svg className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r="70" className="stroke-slate-100 fill-none" strokeWidth="8" />
          <circle
            cx="80"
            cy="80"
            r="70"
            className="stroke-blue-600 fill-none transition-all duration-300 ease-out"
            strokeWidth="8"
            strokeDasharray={440}
            strokeDashoffset={440 - (440 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{progress}%</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Processing</span>
        </div>
      </div>

      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h2 className="text-2xl font-bold text-slate-900">Magical things happening</h2>
        <p className="text-slate-500 min-h-[1.5rem] transition-all duration-300 italic">
          {steps[step]}
        </p>
      </div>

      <div className="mt-12 w-full max-w-xs p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[10px] text-slate-500 text-left leading-tight font-medium uppercase tracking-tight">
          Privacy Note: Processing is secure and encrypted. Documents are only used for your personal analysis.
        </p>
      </div>
    </div>
  );
};

export default Processing;
