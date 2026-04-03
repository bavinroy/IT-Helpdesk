
import React, { useState, useRef, useEffect } from 'react';
import { chatWithBot, analyzeTicketWithAI } from '../geminiService';
import { Message, TicketPriority } from '../types';
import { PlusCircle } from 'lucide-react';

interface ChatbotProps {
  onCreateTicket?: (ticket: any) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onCreateTicket }) => {
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
      // Pass recent history to the bot for context
      const history = messages.slice(-5).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [m.text]
      }));

      const botResponse = await chatWithBot(history, input);
      const botMsg: Message = { id: (Date.now() + 1).toString(), text: botResponse, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualTicketCreation = async () => {
    if (!onCreateTicket) return;

    // Simple heuristic: Take the last user message as the "issue"
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (!lastUserMsg) {
      alert("Please describe your issue in the chat first!");
      return;
    }

    setIsLoading(true);
    const tempId = Math.random().toString(36).substr(2, 9);

    try {
      // Create optimistic ticket
      onCreateTicket({
        id: tempId,
        title: "Chat Request: " + lastUserMsg.text.substring(0, 30) + "...",
        description: lastUserMsg.text,
        category: 'Analyzing...',
        priority: TicketPriority.MEDIUM,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        userId: 'current_user',
        aiSuggestedSolution: 'Processing chat context...'
      });

      // Analyze
      const aiResult = await analyzeTicketWithAI("Chat Request", lastUserMsg.text);

      // Update ticket
      onCreateTicket({
        id: tempId,
        title: "Chat Request: " + lastUserMsg.text.substring(0, 30) + "...",
        description: lastUserMsg.text,
        category: aiResult?.category || 'General',
        priority: (aiResult?.priority as TicketPriority) || TicketPriority.MEDIUM,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        userId: 'current_user',
        aiSuggestedSolution: aiResult?.suggestedSolution || 'Check chat history for details.'
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `✅ I've automatically raised a ticket (ID: ${tempId}) for this issue based on our chat. Ideally, I would now close this session.`,
        sender: 'bot',
        timestamp: new Date()
      }]);

    } catch (e) {
      console.error(e);
      alert("Failed to auto-create ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <div className="bg-indigo-600 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
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

        {onCreateTicket && (
          <button
            onClick={handleManualTicketCreation}
            title="Convert Chat to Ticket"
            className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-white/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ticket</span>
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700 rounded-tl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-500 rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-500 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about VPN, passwords..."
          className="flex-1 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition-all outline-none dark:text-white dark:placeholder-slate-500"
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
