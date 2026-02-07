
import React from 'react';
import { AppScreen, SupportedLanguage } from '../types';

interface NavigationProps {
  currentScreen: AppScreen;
  preferredLanguage: SupportedLanguage;
  onNavigate: (screen: AppScreen) => void;
  onScan: () => void;
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentScreen, preferredLanguage, onNavigate, onScan, className }) => {
  return (
    <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-slate-100 px-1 py-3 flex justify-between items-center z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] ${className}`}>
      {/* Home */}
      <button 
        onClick={() => onNavigate('HOME')}
        className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${currentScreen === 'HOME' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={currentScreen === 'HOME' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-[7px] font-black uppercase tracking-widest">Home</span>
      </button>

      {/* Agenda */}
      <button 
        onClick={() => onNavigate('AGENDA')}
        className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${currentScreen === 'AGENDA' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={currentScreen === 'AGENDA' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <span className="text-[7px] font-black uppercase tracking-widest">Agenda</span>
      </button>

      {/* Scan Button (Center) */}
      <div className="relative -top-8 px-2">
        <button 
          onClick={onScan}
          className="bg-indigo-600 text-white p-4 rounded-[24px] shadow-xl shadow-indigo-200 active:scale-90 transition-all border-4 border-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Insights */}
      <button 
        onClick={() => onNavigate('INSIGHTS')}
        className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${currentScreen === 'INSIGHTS' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={currentScreen === 'INSIGHTS' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
        <span className="text-[7px] font-black uppercase tracking-widest">Insights</span>
      </button>

      {/* Vault (Library) */}
      <button 
        onClick={() => onNavigate('LIBRARY')}
        className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${currentScreen === 'LIBRARY' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={currentScreen === 'LIBRARY' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        <span className="text-[7px] font-black uppercase tracking-widest">Vault</span>
      </button>
    </div>
  );
};

export default Navigation;
