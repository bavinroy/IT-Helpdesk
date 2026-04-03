import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Ticket, TicketPriority, TicketStatus } from '../types';

interface TicketFormProps {
  onTicketCreated: (ticket: Ticket) => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onTicketCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newTicket: Ticket = {
      id: `TK-${Math.floor(Math.random() * 10000)}`,
      title,
      description,
      category,
      priority,
      status: TicketStatus.OPEN,
      createdAt: new Date().toISOString(),
      userId: user?.id || 'unknown',
      createdBy: user?.name,
    };

    onTicketCreated(newTicket);
    setTitle('');
    setDescription('');
    setCategory('Hardware');
    setPriority(TicketPriority.MEDIUM);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
          placeholder="e.g. Laptop Screen Flickering"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
          >
            <option>Hardware</option>
            <option>Software</option>
            <option>Network</option>
            <option>Access</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
          >
            <option value={TicketPriority.LOW}>Low</option>
            <option value={TicketPriority.MEDIUM}>Medium</option>
            <option value={TicketPriority.HIGH}>High</option>
            <option value={TicketPriority.CRITICAL}>Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[100px] resize-none dark:text-white"
          placeholder="Describe the issue in detail..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Ticket
          </>
        )}
      </button>
    </form>
  );
};
