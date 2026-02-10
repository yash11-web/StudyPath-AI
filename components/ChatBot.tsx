import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Loader2, Book, Globe } from 'lucide-react';
import { ChatMessage, Subject } from '../types';
import { getAITutorResponse } from '../services/geminiService';

interface ChatBotProps {
  subject: Subject;
}

const ChatBot: React.FC<ChatBotProps> = ({ subject }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'rag' | 'general'>('rag');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getAITutorResponse(subject.name, subject.syllabusContent, messages, input, mode);
      setMessages(prev => [...prev, { role: 'model', text: response, timestamp: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Connectivity Error: Failed to reach the AI engine.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700">
      <div className="p-8 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-xl leading-tight tracking-tight uppercase">Oracle AI</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{mode === 'rag' ? `Synthesizing ${subject.name}` : 'General Intelligence'}</p>
          </div>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-2xl">
           <button 
            onClick={() => setMode('rag')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'rag' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             <Book className="w-3.5 h-3.5" /> Subject
           </button>
           <button 
            onClick={() => setMode('general')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'general' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             <Globe className="w-3.5 h-3.5" /> Global
           </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30 scroll-smooth">
        {messages.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-50">
              <Sparkles className="w-12 h-12" />
            </div>
            <h4 className="font-black text-3xl text-slate-900 tracking-tighter">How can I assist your mastery?</h4>
            <p className="text-slate-400 mt-4 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-relaxed">
              {mode === 'rag' 
                ? `I am indexed on ${subject.name}. Ask me about complex concepts or syllabus specifics.` 
                : "Switching to global intelligence for broader academic support and techniques."}
            </p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-7 rounded-[2rem] text-sm leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-slate-900 text-white rounded-br-none' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none font-medium'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] rounded-bl-none shadow-sm flex items-center gap-4">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Inquiry...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-50 flex gap-4 shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Clarify a concept or ask for techniques..."
          className="flex-1 bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none placeholder-slate-300 shadow-inner"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-blue-600 text-white px-8 rounded-2xl hover:bg-slate-900 transition-all shadow-2xl shadow-blue-100 disabled:opacity-20"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;