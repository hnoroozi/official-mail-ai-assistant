
import React, { useMemo } from 'react';
import { LetterItem, SupportedLanguage } from '../types.ts';
import { translations } from '../translations.ts';

interface InsightsProps {
  history: LetterItem[];
  preferredLanguage: SupportedLanguage;
}

const Insights: React.FC<InsightsProps> = ({ history, preferredLanguage }) => {
  const t = translations[preferredLanguage] || translations.English;

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach(h => {
      counts[h.analysis.category] = (counts[h.analysis.category] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [history]);

  const maxCount = Math.max(...categoryData.map(c => c.count), 1);

  const urgencyStats = useMemo(() => {
    const stats = { High: 0, Medium: 0, Low: 0 };
    history.forEach(h => {
      const level = h.analysis.urgency.level as keyof typeof stats;
      if (stats.hasOwnProperty(level)) {
        stats[level]++;
      }
    });
    return stats;
  }, [history]);

  const timelineData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        label: d.toLocaleString('default', { month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear(),
        count: 0
      };
    });

    history.forEach(h => {
      const d = new Date(h.createdAt);
      const monthIdx = last6Months.findIndex(m => m.month === d.getMonth() && m.year === d.getFullYear());
      if (monthIdx !== -1) {
        last6Months[monthIdx].count++;
      }
    });

    return last6Months;
  }, [history]);

  const maxTimelineCount = Math.max(...timelineData.map(t => t.count), 1);

  return (
    <div className="p-6 pb-32">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t.insights}</h1>
        <p className="text-slate-500 font-medium">AI-driven patterns in your paperwork.</p>
      </header>

      {history.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-slate-400 font-bold text-sm">Waiting for data...</p>
          <p className="text-slate-400 text-xs mt-1">Scan your first letter to see insights.</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-white p-4 rounded-3xl border border-slate-100 text-center shadow-sm">
                <span className="text-2xl font-black text-rose-600 block">{urgencyStats.High}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Alerts</span>
             </div>
             <div className="bg-white p-4 rounded-3xl border border-slate-100 text-center shadow-sm">
                <span className="text-2xl font-black text-indigo-600 block">{history.length}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Scans</span>
             </div>
             <div className="bg-white p-4 rounded-3xl border border-slate-100 text-center shadow-sm">
                <span className="text-2xl font-black text-emerald-600 block">{categoryData.length}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Types</span>
             </div>
          </div>

          <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Scan Activity</h3>
            <div className="flex items-end justify-between h-32 gap-2">
              {timelineData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-indigo-50 rounded-t-lg relative flex flex-col justify-end overflow-hidden" style={{ height: '100%' }}>
                    <div 
                      className="w-full bg-indigo-600 rounded-t-lg transition-all duration-1000 ease-out"
                      style={{ height: `${(data.count / maxTimelineCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{data.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-6 px-2">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.categoryBreakdown}</h3>
               <span className="text-[10px] font-bold text-indigo-600 uppercase">View Trends</span>
            </div>
            <div className="space-y-5">
              {categoryData.map((cat, i) => (
                <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                    <span className="text-xs font-black text-slate-400">{cat.count}</span>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${(cat.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Insights;
