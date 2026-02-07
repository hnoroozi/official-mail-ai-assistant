
import React, { useMemo } from 'react';
import { LetterItem, SupportedLanguage } from '../types';

interface AgendaProps {
  history: LetterItem[];
  preferredLanguage: SupportedLanguage;
  onToggleAction: (letterId: string, taskIndex: number) => void;
  onSelectLetter: (item: LetterItem) => void;
}

const Agenda: React.FC<AgendaProps> = ({ history, preferredLanguage, onToggleAction, onSelectLetter }) => {
  const groupedTasks = useMemo(() => {
    const lettersWithTasks = history.filter(item => item.analysis.actions.length > 0);
    
    return lettersWithTasks.map(item => ({
      letterId: item.id,
      letterTitle: item.analysis.title,
      letterCategory: item.analysis.category,
      urgency: item.analysis.urgency.level,
      item: item,
      tasks: item.analysis.actions.map((action, idx) => ({
        ...action,
        taskIndex: idx
      }))
    })).sort((a, b) => {
      const urgencyMap = { High: 0, Medium: 1, Low: 2 };
      return urgencyMap[a.urgency as keyof typeof urgencyMap] - urgencyMap[b.urgency as keyof typeof urgencyMap];
    });
  }, [history]);

  const pendingCount = history.reduce((acc, item) => 
    acc + item.analysis.actions.filter(a => !a.completed).length, 0
  );

  return (
    <div className="p-6 pb-32">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Agenda</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 opacity-60">
          {pendingCount} tasks remaining
        </p>
      </header>

      {groupedTasks.length === 0 ? (
        <div className="py-24 text-center bg-slate-50 rounded-[44px] border-2 border-dashed border-slate-200">
          <div className="text-5xl mb-6">✨</div>
          <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Inbox Zero</p>
          <p className="text-slate-400 text-xs mt-1">No action items found in your vault.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedTasks.map((group) => (
            <section key={group.letterId} className="space-y-4">
              <div className="flex justify-between items-end px-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      group.urgency === 'High' ? 'bg-rose-500' :
                      group.urgency === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
                      {group.letterCategory}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 truncate pr-4">{group.letterTitle}</h3>
                </div>
                <button 
                  onClick={() => onSelectLetter(group.item)}
                  className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100"
                >
                  View Doc
                </button>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {group.tasks.map((task) => (
                  <button 
                    key={`${group.letterId}-${task.taskIndex}`}
                    onClick={() => onToggleAction(group.letterId, task.taskIndex)}
                    className={`w-full p-5 flex items-start gap-4 text-left transition-all ${
                      task.completed ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 bg-white'
                    }`}>
                      {task.completed && <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-xs font-bold leading-relaxed ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {task.task}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agenda;
