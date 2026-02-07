
import React, { useState, useMemo } from 'react';
import { LetterItem, SupportedLanguage } from '../types';

interface LibraryProps {
  history: LetterItem[];
  preferredLanguage: SupportedLanguage;
  onBack: () => void;
  onSelectLetter: (item: LetterItem) => void;
  onDelete: (id: string) => void;
}

const Library: React.FC<LibraryProps> = ({ history, preferredLanguage, onBack, onSelectLetter, onDelete }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'urgency'>('recent');

  const categories = useMemo(() => {
    const cats = new Set(history.map(h => h.analysis.category));
    return ['All', ...Array.from(cats)].sort();
  }, [history]);

  const filteredHistory = useMemo(() => {
    let result = history.filter(item => {
      const titleMatch = item.analysis.title.toLowerCase().includes(search.toLowerCase());
      const orgMatch = item.analysis.extracted_fields.organizations.some(o => o.toLowerCase().includes(search.toLowerCase()));
      const matchesSearch = titleMatch || orgMatch;
      const matchesCategory = activeCategory === 'All' || item.analysis.category === activeCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'urgency') {
      const urgencyMap = { 'High': 0, 'Medium': 1, 'Low': 2 };
      result = [...result].sort((a, b) => 
        urgencyMap[a.analysis.urgency.level as keyof typeof urgencyMap] - urgencyMap[b.analysis.urgency.level as keyof typeof urgencyMap]
      );
    } else {
      result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [history, search, activeCategory, sortBy]);

  const handleQuickShare = (e: React.MouseEvent, item: LetterItem) => {
    e.stopPropagation();
    const shareText = `Summary of ${item.analysis.title}: ${item.analysis.summary_paragraph}`;
    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Summary copied to clipboard");
    }
  };

  const getCategoryColor = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('tax')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (c.includes('bank')) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    if (c.includes('insurance')) return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-slate-50 text-slate-500 border-slate-100';
  };

  return (
    <div className="p-6 pb-32">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Vault</h1>
          <p className="text-slate-500 text-sm font-medium">All analyzed documents, secured.</p>
        </div>
        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
          {history.length} Docs
        </span>
      </header>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or sender..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all shadow-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button 
          onClick={() => setSortBy(sortBy === 'recent' ? 'urgency' : 'recent')}
          className={`px-4 rounded-2xl border transition-all flex items-center justify-center ${sortBy === 'urgency' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap border uppercase tracking-widest ${
              activeCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 text-sm font-bold">No documents match your search.</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div 
              key={item.id}
              className="relative group animate-in fade-in duration-300"
            >
              <button 
                onClick={() => onSelectLetter(item)}
                className="w-full flex items-center gap-4 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all text-left active:scale-[0.99]"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-50">
                  <img src={item.imageUrls[0]} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pr-12">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter ${getCategoryColor(item.analysis.category)}`}>
                      {item.analysis.category}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.analysis.urgency.level === 'High' ? 'bg-rose-500' :
                      item.analysis.urgency.level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                  </div>
                  <h3 className="font-bold text-slate-900 truncate text-sm leading-tight">{item.analysis.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    {item.analysis.extracted_fields.organizations[0] || 'Unknown Sender'} • {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <button 
                  onClick={(e) => handleQuickShare(e, item)}
                  className="p-2.5 text-indigo-600 bg-indigo-50 rounded-xl shadow-sm hover:bg-indigo-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Library;
