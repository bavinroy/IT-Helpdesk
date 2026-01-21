
import React, { useState, useRef, useEffect } from 'react';
import { chatWithBot } from '../geminiService';
import { Message } from '../types';

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I am your IT Assistant. How can I help you today?', sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await chatWithBot([], input);
      const botMsg: Message = { id: (Date.now() + 1).toString(), text: botResponse || 'I am having trouble connecting.', sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-indigo-600 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">IT Support Bot</h3>
          <p className="text-indigo-100 text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-slate-200 rounded-tl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-white flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about VPN, passwords..."
          className="flex-1 text-sm bg-slate-100 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
        />
        <button 
          onClick={handleSend}
          className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </div>
    </div>
  );
};
