
import React, { useState } from 'react';
import { analyzeTicketWithAI } from '../geminiService';
import { TicketPriority } from '../types';

interface TicketFormProps {
  onTicketCreated: (ticket: any) => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onTicketCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      // Simulate Backend ML Service Call
      const aiResult = await analyzeTicketWithAI(title, description);
      setPrediction(aiResult);
      
      const newTicket = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        description,
        category: aiResult.category,
        priority: aiResult.priority as TicketPriority,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        aiSuggestedSolution: aiResult.suggestedSolution
      };
      
      onTicketCreated(newTicket);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert("Failed to create ticket");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        Raise Support Ticket
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Issue Title</label>
          <input 
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Printer not responding on 3rd floor"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Details</label>
          <textarea 
            required
            rows={4}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the problem in detail..."
          />
        </div>
        
        {isAnalyzing ? (
          <div className="bg-indigo-50 p-4 rounded-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-indigo-700 text-sm font-medium">ML Models analyzing priority and category...</span>
          </div>
        ) : (
          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
          >
            Submit with AI Analysis
          </button>
        )}

        {prediction && (
          <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-green-700 uppercase">AI Classification Result</span>
              <span className="bg-green-200 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">ML CONFIRMED</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
              <div className="text-slate-600 italic">Category: <b className="text-slate-800 not-italic">{prediction.category}</b></div>
              <div className="text-slate-600 italic">Priority: <b className="text-slate-800 not-italic">{prediction.priority}</b></div>
            </div>
            <p className="text-xs text-green-800 leading-relaxed"><span className="font-bold">Staff Recommendation:</span> {prediction.suggestedSolution}</p>
          </div>
        )}
      </form>
    </div>
  );
};
