
import React, { useState, useEffect, useRef } from 'react';
import { LetterAnalysis, Message, SupportedLanguage } from '../types.ts';
import { createLetterChat } from '../services/geminiService.ts';

interface ChatProps {
  analysis: LetterAnalysis;
  preferredLanguage: SupportedLanguage;
  onBack: () => void;
}

const Chat: React.FC<ChatProps> = ({ analysis, preferredLanguage, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = createLetterChat(analysis, preferredLanguage);
    
    const welcome: Message = {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm ready to discuss this letter from **${analysis.extracted_fields.organizations[0] || analysis.category}**. You can ask me questions in ${preferredLanguage}.`,
      timestamp: Date.now(),
    };
    setMessages([welcome]);
  }, [analysis, preferredLanguage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMessage.text });
      const modelMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: response.text || "I'm sorry, I couldn't process that. Can you rephrase?",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="font-bold text-slate-900 truncate text-sm">Assistant</h1>
            <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">{analysis.title}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100 uppercase tracking-widest">
          {preferredLanguage}
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white text-slate-400 border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100 pb-10">
        <div className="flex gap-2 items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask in ${preferredLanguage}...`}
            className="flex-1 bg-transparent border-none py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={`p-2 rounded-xl transition-all ${
              inputValue.trim() && !isTyping ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-100' : 'bg-slate-200 text-slate-400 scale-90'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
