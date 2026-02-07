
import React, { useRef, useMemo } from 'react';
import { LetterItem, SupportedLanguage } from '../types';
import { translations } from '../translations';

interface HomeProps {
  onScan: () => void;
  onUpload: (images: string[]) => void;
  history: LetterItem[];
  preferredLanguage: SupportedLanguage;
  userName: string;
  onSeeAll: () => void;
  onSelectLetter: (item: LetterItem) => void;
  onSettings: () => void;
}

const Home: React.FC<HomeProps> = ({ onScan, onUpload, history, preferredLanguage, userName, onSeeAll, onSelectLetter, onSettings }) => {
  const t = translations[preferredLanguage] || translations.English;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => onUpload([reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const pendingTasksCount = history.reduce((acc, item) => 
    acc + item.analysis.actions.filter(a => !a.completed).length, 0
  );

  const urgentTasksCount = history.reduce((acc, item) => 
    acc + (item.analysis.urgency.level === 'High' ? 1 : 0), 0
  );

  const financialStats = useMemo(() => {
    let total = 0;
    const currency = '$';
    history.forEach(item => {
      const isUnpaid = item.analysis.actions.some(a => !a.completed && a.task.toLowerCase().includes('pay'));
      if (isUnpaid) {
        item.analysis.extracted_fields.amounts.forEach(amt => {
          const num = parseFloat(amt.replace(/[^0-9.]/g, ''));
          if (!isNaN(num)) total += num;
        });
      }
    });
    return { total, currency };
  }, [history]);

  const activeReminders = history.flatMap(item => 
    item.analysis.deadlines
      .map((d, idx) => ({ ...d, item, deadlineIdx: idx, dateObj: new Date(d.date) }))
      .filter(d => d.reminderSet && !isNaN(d.dateObj.getTime()) && d.dateObj >= new Date())
  ).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('tax')) return '💰';
    if (cat.includes('bank')) return '🏦';
    if (cat.includes('insurance')) return '🛡️';
    return '📄';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 pb-24">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Dashboard</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 opacity-60">Your Official Paper Trail</p>
        </div>
        <button 
          onClick={onSettings}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
          aria-label="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Personalized AI Greeting */}
      <div className="mb-10 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-6 rounded-[40px] shadow-sm flex items-center gap-4 relative overflow-hidden group">
         <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 shrink-0">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
           </svg>
         </div>
         <div className="flex-1">
            <h3 className="text-sm font-black text-slate-900 mb-0.5">{getGreeting()}, {userName}</h3>
            <p className="text-xs text-slate-500 font-medium leading-tight">
              {urgentTasksCount > 0 
                ? `You have ${urgentTasksCount} urgent documents that need a reply today.`
                : pendingTasksCount > 0 
                  ? `You're doing great. ${pendingTasksCount} tasks remain on your list.` 
                  : "Everything is handled. Your vault is in order."}
            </p>
         </div>
         <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-100/30 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-slate-900 p-6 rounded-[36px] text-white shadow-xl shadow-slate-100 flex flex-col justify-between h-40">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <span className="text-4xl font-black block leading-none">{pendingTasksCount}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-2 block">Pending Actions</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-[36px] shadow-sm flex flex-col justify-between h-40">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-tight truncate">{financialStats.currency}{financialStats.total.toLocaleString()}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 block">Outstanding</span>
          </div>
        </div>
      </div>

      <section className="mb-12 space-y-4">
        <button onClick={onScan} className="w-full bg-indigo-600 rounded-[36px] p-6 text-white flex items-center gap-5 group shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg></div>
          <div className="text-left flex-1"><span className="text-xl font-black block">Scan Letter</span><span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Explain & File Automatically</span></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white border-2 border-slate-100 rounded-[32px] p-5 text-slate-500 flex items-center justify-center gap-3 active:bg-slate-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest">{t.uploadFiles}</span>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
        </button>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Vault Activity</h2>
          <button onClick={onSeeAll} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">See All</button>
        </div>
        {history.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[44px] p-16 text-center">
            <p className="text-slate-400 text-sm font-bold opacity-60">Your vault is empty.<br/>Start by scanning a letter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.slice(0, 3).map((item) => (
              <button key={item.id} onClick={() => onSelectLetter(item)} className="w-full flex items-center gap-5 bg-white p-5 rounded-[40px] border border-slate-100 shadow-sm text-left active:scale-[0.98] transition-all group">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{getCategoryIcon(item.analysis.category)}</div>
                <div className="flex-1 truncate">
                  <h3 className="font-bold text-slate-900 truncate text-sm">{item.analysis.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{item.analysis.category}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[9px] text-slate-400 font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${item.analysis.urgency.level === 'High' ? 'bg-rose-500' : 'bg-slate-200'}`} />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
