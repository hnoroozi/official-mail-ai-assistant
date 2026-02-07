
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [hasConsent, setHasConsent] = useState(false);

  const steps = [
    {
      title: "Confusing Letters?",
      description: "We translate complex government, bank, and insurance mail into plain language you actually understand.",
      icon: (
        <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 mb-10 shadow-lg shadow-indigo-100/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      )
    },
    {
      title: "Actionable Steps",
      description: "Get a clear checklist of what to do next, extracted deadlines, and urgency levels so you never miss a thing.",
      icon: (
        <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-600 mb-10 shadow-lg shadow-emerald-100/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      )
    },
    {
      title: "Bank-Grade Privacy",
      description: "Your data is processed securely. We don't sell your info, and you can wipe your vault at any time with one tap.",
      icon: (
        <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-white mb-10 shadow-lg shadow-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else if (hasConsent) {
      onComplete();
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-white overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        {currentStep.icon}
        <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-none px-4">{currentStep.title}</h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xs mx-auto opacity-80">
          {currentStep.description}
        </p>
      </div>

      <div className="pb-10">
        <div className="flex gap-2.5 justify-center mb-12">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-10 bg-indigo-600' : 'w-2.5 bg-slate-100'}`} 
            />
          ))}
        </div>

        {isLastStep && (
          <div className="mb-8 p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex gap-4 items-start cursor-pointer group" onClick={() => setHasConsent(!hasConsent)}>
            <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
              hasConsent ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
            }`}>
              {hasConsent && <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">I consent to document analysis</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">Required for AI summarization</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleNext}
          disabled={isLastStep && !hasConsent}
          className={`w-full py-5 rounded-[28px] font-black text-lg transition-all shadow-xl ${
            isLastStep && !hasConsent 
              ? 'bg-slate-100 text-slate-400' 
              : 'bg-indigo-600 text-white shadow-indigo-100 active:scale-95'
          }`}
        >
          {step === steps.length - 1 ? "Secure Get Started" : "Continue"}
        </button>
        
        <p className="text-center text-[9px] text-slate-300 font-black uppercase tracking-widest mt-6 opacity-60">
          v1.0.4 • High-Trust Engineering
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
