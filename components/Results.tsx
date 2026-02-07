
import React, { useState, useRef } from 'react';
import { LetterAnalysis, UrgencyLevel, ReplyTemplate, SupportedLanguage } from '../types';
import { generateSpeech, refineDraft } from '../services/geminiService';
import { decodeBase64, decodeAudioData } from '../utils/audioUtils';
import { translations } from '../translations';
import { generateGoogleCalendarLink } from '../utils/calendarUtils';

interface ResultsProps {
  analysis: LetterAnalysis;
  images: string[];
  targetLanguage: SupportedLanguage;
  verifiedFields: string[];
  onBack: () => void;
  onAskQuestion: () => void;
  onToggleAction: (idx: number) => void;
  onToggleReminder: (idx: number) => void;
  onToggleVerification: (fieldId: string) => void;
  onDelete?: () => void;
}

// Interface for VerifyChip props
interface VerifyChipProps {
  text: string;
  id: string;
  label: string;
  isVerified: boolean;
  onToggle: (id: string) => void;
}

// FIX: Properly type VerifyChip as React.FC to handle React-reserved props like 'key' correctly in TypeScript
const VerifyChip: React.FC<VerifyChipProps> = ({ 
  text, 
  id, 
  label, 
  isVerified, 
  onToggle 
}) => {
  return (
    <button 
      onClick={() => onToggle(id)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
        isVerified ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'bg-white border-slate-100 text-slate-600'
      }`}
    >
      <span className="opacity-50 uppercase tracking-tighter">{label}:</span>
      <span className="truncate max-w-[100px]">{text}</span>
    </button>
  );
};

const Results: React.FC<ResultsProps> = ({ 
  analysis, 
  images, 
  targetLanguage, 
  verifiedFields,
  onBack, 
  onAskQuestion, 
  onToggleAction, 
  onToggleReminder,
  onToggleVerification,
  onDelete 
}) => {
  const t = translations[targetLanguage] || translations.English;
  const [showTranslated, setShowTranslated] = useState(!!analysis.translation);
  const [showOriginal, setShowOriginal] = useState(false);
  
  const [editingReply, setEditingReply] = useState<ReplyTemplate | null>(null);
  const [draftBody, setDraftBody] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const summaryParagraph = analysis.summary_paragraph || "No summary available.";
  const urgencyLevel = (analysis.urgency?.level as UrgencyLevel) || UrgencyLevel.LOW;
  const deadlines = analysis.deadlines || [];
  const fields = analysis.extracted_fields;
  const callQuestions = analysis.questions_to_ask_office || [];

  const activeSummaryParagraph = (showTranslated && analysis.translation) 
    ? analysis.translation.summary_paragraph 
    : summaryParagraph;

  const activeChecklist = (showTranslated && analysis.translation)
    ? analysis.translation.actions
    : analysis.actions;

  const handleShareSummary = async () => {
    const shareText = `📄 ${analysis.title}\n💡 SUMMARY: ${activeSummaryParagraph}`;
    if (navigator.share) {
      try { await navigator.share({ title: analysis.title, text: shareText }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Summary copied!");
    }
  };

  const handleRefine = async (instruction: string) => {
    setIsRefining(true);
    try {
      const refined = await refineDraft(draftBody, instruction);
      setDraftBody(refined);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  const handlePlaySummary = async () => {
    if (isPlaying) {
      audioSourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }
    setIsLoadingAudio(true);
    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      const base64Audio = await generateSpeech(activeSummaryParagraph);
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      audioSourceRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (err) { console.error(err); } finally { setIsLoadingAudio(false); }
  };

  const phoneScript = `Hello, I'm calling about "${analysis.title}". My ref is ${fields.reference_numbers[0] || "[Ref]"}. I want to ask: ${callQuestions.join(' ')}`;

  return (
    <div className="bg-slate-50 min-h-full pb-32">
      <div className="bg-indigo-600 px-6 py-2 flex items-center justify-between text-[10px] text-white/80 font-black uppercase tracking-widest no-print">
        <div className="flex items-center gap-2">
          <span>{t.confidence}</span>
          <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-1000" style={{ width: `${analysis.confidence_score}%` }} />
          </div>
          <span>{analysis.confidence_score}%</span>
        </div>
        <button onClick={() => setShowOriginal(true)} className="underline decoration-white/40">{t.originalScan}</button>
      </div>

      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center no-print">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-900"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
        <div className="flex items-center gap-2">
           {analysis.translation && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setShowTranslated(false)} className={`px-3 py-1 text-[10px] font-bold rounded-lg ${!showTranslated ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>EN</button>
              <button onClick={() => setShowTranslated(true)} className={`px-3 py-1 text-[10px] font-bold rounded-lg ${showTranslated ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{targetLanguage.substring(0,2).toUpperCase()}</button>
            </div>
           )}
           <button onClick={handleShareSummary} className="p-2 text-indigo-600"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Card */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-indigo-50 text-indigo-600 border-indigo-100`}>
              {analysis.category}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">{analysis.title}</h1>
          
          {/* Urgency Meter */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Urgency Level</span>
              <span className={`text-xs font-black uppercase ${
                urgencyLevel === UrgencyLevel.HIGH ? 'text-rose-600' :
                urgencyLevel === UrgencyLevel.MEDIUM ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {urgencyLevel}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full flex gap-1 overflow-hidden">
               <div className={`flex-1 h-full ${urgencyLevel === UrgencyLevel.LOW ? 'bg-emerald-500' : 'bg-emerald-100'}`} />
               <div className={`flex-1 h-full ${urgencyLevel === UrgencyLevel.MEDIUM ? 'bg-amber-500' : 'bg-amber-100'}`} />
               <div className={`flex-1 h-full ${urgencyLevel === UrgencyLevel.HIGH ? 'bg-rose-500' : 'bg-rose-100'}`} />
            </div>
            {analysis.urgency.reasons.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {analysis.urgency.reasons.map((r, i) => (
                  <span key={i} className="text-[9px] font-bold text-slate-500 bg-white border border-slate-100 px-2 py-0.5 rounded-full">
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <p className="text-slate-600 leading-relaxed text-sm pr-12">{activeSummaryParagraph}</p>
            <button onClick={handlePlaySummary} className={`absolute right-0 top-0 p-2 rounded-xl ${isPlaying ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-indigo-600'}`}>
              {isLoadingAudio ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
            </button>
          </div>
        </div>

        {/* Verification */}
        <div className="space-y-3">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t.verifyAll}</h3>
           <div className="flex flex-wrap gap-2">
              {/* FIX: Use explicitly passed required props including verified status derived from state */}
              {fields.organizations.map((org, i) => <VerifyChip key={`org-${i}`} text={org} id={`org-${i}`} label="Sender" isVerified={verifiedFields.includes(`org-${i}`)} onToggle={onToggleVerification} />)}
              {fields.amounts.map((amt, i) => <VerifyChip key={`amt-${i}`} text={amt} id={`amt-${i}`} label="Amount" isVerified={verifiedFields.includes(`amt-${i}`)} onToggle={onToggleVerification} />)}
              {fields.reference_numbers.map((ref, i) => <VerifyChip key={`ref-${i}`} text={ref} id={`ref-${i}`} label="Ref #" isVerified={verifiedFields.includes(`ref-${i}`)} onToggle={onToggleVerification} />)}
              {deadlines.map((d, i) => <VerifyChip key={`date-${i}`} text={d.date} id={`date-${i}`} label="Due" isVerified={verifiedFields.includes(`date-${i}`)} onToggle={onToggleVerification} />)}
           </div>
        </div>

        {/* Deadlines Section */}
        {deadlines.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Key Dates</h3>
            {deadlines.map((d, i) => (
              <div key={i} className="bg-white p-4 rounded-[28px] border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{d.description}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{d.date}</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(generateGoogleCalendarLink(analysis.title, d.date, d.description), '_blank')}
                  className="p-3 bg-slate-50 text-indigo-600 rounded-xl active:scale-90 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t.requiredActions}</h3>
          <div className="space-y-3">
            {activeChecklist.map((action, i) => (
              <button 
                key={i} 
                onClick={() => onToggleAction(i)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all ${action.completed ? 'bg-slate-50' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${action.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 bg-white'}`}>
                  {action.completed && <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className={`text-xs font-bold leading-tight ${action.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{action.task}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 no-print">
          <button onClick={onAskQuestion} className="w-full py-4 bg-indigo-600 text-white rounded-[32px] font-bold text-sm shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
            {t.askAssistant}
          </button>
          <button onClick={onDelete} className="w-full py-4 text-slate-300 font-black uppercase tracking-widest text-[10px]">{t.deleteDoc}</button>
        </div>
      </div>

      {/* Lightbox */}
      {showOriginal && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-300">
           <header className="p-6 flex justify-between items-center text-white">
              <h3 className="font-black text-sm uppercase tracking-widest">{t.originalScan}</h3>
              <button onClick={() => setShowOriginal(false)} className="p-2 bg-white/10 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
           </header>
           <div className="flex-1 overflow-auto p-4 space-y-4">
             {images.map((img, i) => (
               <img key={i} src={img} className="w-full rounded-2xl border border-white/10" alt={`Page ${i+1}`} />
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Results;
