
import React from 'react';
import { SupportedLanguage } from '../types';
import { translations } from '../translations';

interface HelpProps {
  preferredLanguage: SupportedLanguage;
  onBack: () => void;
}

const Help: React.FC<HelpProps> = ({ preferredLanguage, onBack }) => {
  const t = translations[preferredLanguage] || translations.English;
  const sections = t.helpSections;

  const getIcon = (key: string) => {
    switch (key) {
      case 'dashboard': return '📊';
      case 'scanning': return '📸';
      case 'agenda': return '📅';
      case 'insights': return '📈';
      case 'vault': return '🔒';
      case 'chat': return '💬';
      case 'privacy': return '🛡️';
      default: return '📄';
    }
  };

  const isRtl = preferredLanguage === 'Persian' || preferredLanguage === 'Arabic';

  return (
    <div className={`p-6 pb-24 bg-slate-50 min-h-full ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors ${isRtl ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t.help}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.helpIntro}</p>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {/* About Section - Highlighted Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[32px] p-8 shadow-sm animate-in fade-in zoom-in duration-500">
           <div className={`flex items-center gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">✨</div>
              <h2 className="text-xl font-black text-indigo-900">{(t as any).about}</h2>
           </div>
           <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
             "{(t as any).aboutContent}"
           </p>
        </div>

        {/* Existing Help Sections */}
        {Object.entries(sections).map(([key, value]) => (
          <div 
            key={key} 
            className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom duration-500"
          >
            <div className={`flex items-start gap-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                {getIcon(key)}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{(value as any).title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {(value as any).content}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-10">
          <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-10 -mt-10"></div>
            <h3 className="text-xl font-bold mb-4">Still have questions?</h3>
            <p className="text-sm text-indigo-100 leading-relaxed mb-6">
              Our support team is here to help with any technical issues or feedback.
            </p>
            <button className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-xs shadow-lg active:scale-95 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
