
import React, { useState } from 'react';
import { SupportedLanguage, LetterItem, AppSettings } from '../types';
import { translations } from '../translations';

interface SettingsProps {
  onBack: () => void;
  preferredLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onReset: () => void;
  history: LetterItem[];
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onHelp: () => void;
}

type SubscriptionStep = 'INFO' | 'CHANGE_PLAN' | 'PAYMENT' | 'CANCEL';

const Settings: React.FC<SettingsProps> = ({ 
  onBack, 
  preferredLanguage, 
  onLanguageChange, 
  onReset, 
  history,
  settings,
  onUpdateSettings,
  onHelp
}) => {
  const t = translations[preferredLanguage] || translations.English;
  const isRtl = preferredLanguage === 'Persian' || preferredLanguage === 'Arabic';

  const [showLegal, setShowLegal] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [subscriptionStep, setSubscriptionStep] = useState<SubscriptionStep>('INFO');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  const languages: SupportedLanguage[] = ['English', 'Spanish', 'French', 'Arabic', 'Chinese', 'Persian'];

  // Helper to get initials from userName
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `explain-my-letter-export-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const closeSubscription = () => {
    setShowSubscription(false);
    setTimeout(() => setSubscriptionStep('INFO'), 300);
  };

  return (
    <div className={`relative p-6 pb-32 bg-slate-50 min-h-full overflow-x-hidden ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors ${isRtl ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{t.settings}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-100 shrink-0 transition-all duration-500">
          {getInitials(settings.userName)}
        </div>
      </header>

      <div className="space-y-8">
        {/* Profile Section */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">Profile</h3>
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm p-5">
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 px-1">Display Name</label>
            <input 
              type="text" 
              value={settings.userName} 
              onChange={(e) => onUpdateSettings({ userName: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        {/* Pro Status Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group" dir="ltr">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Current Plan</span>
                <h3 className="text-xl font-bold">Pro Member</h3>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">Active</span>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-bold mb-1 opacity-60">
                  <span>SCANS USED</span>
                  <span>UNLIMITED</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSubscription(true)}
              className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-bold text-xs shadow-lg active:scale-[0.98] transition-all hover:bg-slate-50"
            >
              Manage Subscription
            </button>
          </div>
        </div>

        {/* Language Section */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">{t.nativeLang}</h3>
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm p-4">
            <div className="grid grid-cols-2 gap-2" dir="ltr">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`py-3 px-4 rounded-2xl text-sm font-medium transition-all ${
                    preferredLanguage === lang 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[9px] text-slate-400 font-medium px-1 leading-relaxed">{t.langNote}</p>
          </div>
        </div>

        {/* Information & Help */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">Info & Legal</h3>
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-50">
            <button onClick={onHelp} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-3">
                <span className="text-xl">📖</span>
                <span className="text-sm font-bold text-slate-700">{t.help}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-slate-300 ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button 
              onClick={() => setShowLegal(true)}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚖️</span>
                <span className="text-sm font-bold text-slate-700">{t.legalTitle}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-slate-300 ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Security & Access */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">Security</h3>
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-50">
            <button 
              onClick={() => onUpdateSettings({ biometricLock: !settings.biometricLock })}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔐</span>
                <div>
                  <p className="text-sm font-bold text-slate-700">Biometric Lock</p>
                  <p className="text-[10px] text-slate-400 font-medium">Require FaceID</p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative p-1 flex items-center transition-all ${settings.biometricLock ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`} dir="ltr">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </button>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button 
            onClick={() => setShowResetConfirm(true)} 
            className="w-full py-4 text-rose-500 font-black rounded-2xl border border-rose-100 hover:bg-rose-50 transition-all text-[10px] uppercase tracking-widest"
          >
            {t.resetData}
          </button>
          <p className="text-center text-[9px] text-slate-300 font-medium">Version 1.0.4 • High-Trust Engineering</p>
        </div>
      </div>

      {/* Subscription Overlay */}
      {showSubscription && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300" dir="ltr">
          <div className="w-full max-w-md bg-white rounded-t-[40px] p-8 pb-12 animate-in slide-in-from-bottom duration-500 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto mb-8 shrink-0" />
            <div className="flex-1 overflow-y-auto">
              {subscriptionStep === 'INFO' && (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Subscription Details</h2>
                  <p className="text-sm text-slate-500 mb-8">Manage your billing and plan options.</p>
                  <div className="space-y-4 mb-10">
                    <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[28px] flex justify-between items-center shadow-sm">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Next Billing Date</p>
                        <p className="text-sm font-bold text-indigo-900">October 12, 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Amount</p>
                        <p className="text-sm font-bold text-indigo-900">$6.99/mo</p>
                      </div>
                    </div>
                    <div className="p-5 border border-slate-100 rounded-[28px] flex justify-between items-center bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-slate-900 rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                        <p className="text-sm font-bold text-slate-700">•••• 4242</p>
                      </div>
                      <button onClick={() => setSubscriptionStep('PAYMENT')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors">Update</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button onClick={() => setSubscriptionStep('CHANGE_PLAN')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-all">Change Plan</button>
                    <button onClick={closeSubscription} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors">Close</button>
                  </div>
                  <p className="text-center mt-6 text-[10px] text-rose-500 font-bold uppercase tracking-tight cursor-pointer hover:underline" onClick={() => setSubscriptionStep('CANCEL')}>Cancel Subscription</p>
                </div>
              )}
              {subscriptionStep === 'CHANGE_PLAN' && (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setSubscriptionStep('INFO')} className="p-2 -ml-2 text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                    <h2 className="text-2xl font-black text-slate-900">Select Plan</h2>
                  </div>
                  <div className="flex justify-center mb-8">
                    <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
                      <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Monthly</button>
                      <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Yearly <span className="text-[9px] text-emerald-500">-20%</span></button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-6 border-2 border-slate-100 rounded-[32px] opacity-60">
                      <div className="flex justify-between items-start mb-4">
                        <div><h4 className="text-lg font-bold text-slate-900">Standard</h4><p className="text-xs text-slate-400">Basic support</p></div>
                        <span className="text-lg font-black text-slate-900">$0</span>
                      </div>
                    </div>
                    <div className="p-6 border-2 border-indigo-600 bg-indigo-50/50 rounded-[32px] relative">
                      <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">Current Plan</div>
                      <div className="flex justify-between items-start mb-4">
                        <div><h4 className="text-lg font-bold text-slate-900">Pro</h4><p className="text-xs text-slate-400">Unlimited power</p></div>
                        <span className="text-lg font-black text-slate-900">{billingCycle === 'monthly' ? '$6.99' : '$5.83'}<span className="text-[10px] text-slate-400 font-medium">/mo</span></span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSubscriptionStep('INFO')} className="w-full py-4 mt-8 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all">Keep Current Plan</button>
                </div>
              )}
              {subscriptionStep === 'PAYMENT' && (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setSubscriptionStep('INFO')} className="p-2 -ml-2 text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                    <h2 className="text-2xl font-black text-slate-900">Payment</h2>
                  </div>
                  <div className="mb-8 p-6 bg-slate-900 rounded-[32px] text-white shadow-xl">
                    <p className="text-lg font-bold tracking-[0.2em] mb-4">•••• •••• •••• 4242</p>
                  </div>
                  <button onClick={() => setSubscriptionStep('INFO')} className="w-full py-4 mt-8 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all">Save Changes</button>
                </div>
              )}
              {subscriptionStep === 'CANCEL' && (
                <div className="animate-in fade-in slide-in-from-bottom duration-300 text-center">
                  <h2 className="text-2xl font-black text-slate-900 mb-4">Wait, don't go!</h2>
                  <div className="space-y-3">
                    <button onClick={() => setSubscriptionStep('INFO')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all">Keep My Benefits</button>
                    <button onClick={() => { alert("Simulated: Subscription canceled."); closeSubscription(); }} className="w-full py-4 bg-white text-rose-500 rounded-2xl font-bold text-sm border border-rose-100">Confirm Cancellation</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Overlay */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[120] bg-rose-600/10 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-rose-100 animate-in zoom-in duration-300 text-center">
              <h2 className="text-2xl font-black text-slate-900 mb-4">Are you absolutely sure?</h2>
              <div className="space-y-3">
                <button onClick={() => { onReset(); setShowResetConfirm(false); }} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-[0.98] transition-all">Yes, Delete Everything</button>
                <button onClick={() => setShowResetConfirm(false)} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm">Cancel</button>
              </div>
           </div>
        </div>
      )}

      {/* Legal Disclaimers Overlay - MULTI-LANGUAGE SUPPORT */}
      {showLegal && (
        <div className="fixed inset-0 z-[150] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
          <header className="px-6 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 shrink-0">
             <div className="flex items-center gap-3">
               <span className="text-2xl">⚖️</span>
               <h2 className="text-xl font-black text-slate-900">{t.legalTitle}</h2>
             </div>
             <button onClick={() => setShowLegal(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </header>
          
          <div className={`flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 ${isRtl ? 'text-right' : 'text-left'}`}>
            {(t.legalSections as any[]).map((section, idx) => (
              <section key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600">{section.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {section.content}
                </p>
              </section>
            ))}
            
            <div className="py-4 text-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">End of Disclaimers</p>
            </div>
          </div>

          <footer className="p-6 bg-white border-t border-slate-100 sticky bottom-0 shrink-0">
            <button 
              onClick={() => setShowLegal(false)} 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl shadow-slate-200"
            >
              {t.legalAgree}
            </button>
          </footer>
        </div>
      )}
    </div>
  );
};

export default Settings;
