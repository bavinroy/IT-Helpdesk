
import React, { useState, useEffect, useCallback } from 'react';
import { Chatbot } from './components/Chatbot';
import { TicketForm } from './components/TicketForm';
import { Ticket, TicketPriority, TicketStatus } from './types';
import { useTicketWebSocket } from './geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

const App: React.FC = () => {
  const [notifications, setNotifications] = useState<{id: number, msg: string}[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TK-882',
      title: 'VPN Connection Failure',
      description: 'Unable to connect to the corporate VPN from home network.',
      category: 'Network',
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      createdAt: new Date().toISOString(),
      userId: 'user1'
    },
    {
      id: 'TK-883',
      title: 'Keyboard Keys Sticking',
      description: 'The "E" and "R" keys on my laptop keyboard are unresponsive.',
      category: 'Hardware',
      priority: TicketPriority.LOW,
      status: TicketStatus.IN_PROGRESS,
      createdAt: new Date().toISOString(),
      userId: 'user1'
    }
  ]);

  // Handle incoming "WebSocket" updates
  const handleWebSocketUpdate = useCallback((payload: any) => {
    if (payload.type === 'TICKET_STATUS_CHANGED') {
      // Pick a random ticket to update to simulate real traffic
      setTickets(prev => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        const updated = [...prev];
        const oldStatus = updated[randomIndex].status;
        updated[randomIndex] = {
          ...updated[randomIndex],
          status: payload.data.status
        };
        
        // Push notification
        const newNotif = { 
          id: Date.now(), 
          msg: `Ticket ${updated[randomIndex].id} updated from ${oldStatus} to ${payload.data.status}` 
        };
        setNotifications(n => [newNotif, ...n].slice(0, 3));
        setTimeout(() => setNotifications(n => n.filter(item => item.id !== newNotif.id)), 5000);
        
        return updated;
      });
    }
  }, []);

  const { simulateStatusUpdate } = useTicketWebSocket(handleWebSocketUpdate);

  // Auto-simulate backend pushing updates every 15 seconds
  useEffect(() => {
    const interval = setInterval(simulateStatusUpdate, 15000);
    return () => clearInterval(interval);
  }, [simulateStatusUpdate]);

  const stats = [
    { name: 'Hardware', value: tickets.filter(t => t.category === 'Hardware').length },
    { name: 'Network', value: tickets.filter(t => t.category === 'Network').length },
    { name: 'Software', value: tickets.filter(t => t.category === 'Software').length },
    { name: 'Access', value: tickets.filter(t => t.category === 'Access').length },
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Real-time Notifications Toast */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce pointer-events-auto">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">{n.msg}</span>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <nav className="w-full lg:w-20 bg-slate-900 flex flex-row lg:flex-col items-center py-6 gap-8 px-4 lg:px-0 lg:fixed h-auto lg:h-full z-10">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div className="flex flex-row lg:flex-col gap-6 text-slate-400">
          <button className="hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></button>
          <button className="text-white bg-slate-800 p-2 rounded-lg transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></button>
          <button className="hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></button>
        </div>
        <div className="lg:mt-auto flex gap-4 lg:flex-col">
           <img src="https://picsum.photos/40/40" className="w-10 h-10 rounded-full border-2 border-slate-700" alt="profile" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-20 p-4 lg:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">AI Helpdesk Dashboard</h1>
            <p className="text-slate-500 text-sm">Welcome back, Senior Engineer</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={simulateStatusUpdate}
              className="bg-white border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Trigger Socket Test
            </button>
            <span className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              WS Connection: Live
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Tickets</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{tickets.length}</p>
                <div className="mt-2 text-xs text-green-600 font-medium">Synced in real-time</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">AI Resolution Rate</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">68%</p>
                <div className="mt-2 text-xs text-indigo-600 font-medium">NLP bot optimization active</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Avg. Response</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">14m</p>
                <div className="mt-2 text-xs text-slate-400 font-medium">SLA Target: 30m</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[300px]">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                  Categorization Distribution
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[300px]">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                  Ticket Status Live View
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={[
                        {name: 'Open', value: tickets.filter(t => t.status === 'OPEN').length}, 
                        {name: 'Active', value: tickets.filter(t => t.status === 'IN_PROGRESS').length},
                        {name: 'Resolved', value: tickets.filter(t => t.status === 'RESOLVED').length}
                      ]} 
                      innerRadius={60} 
                      outerRadius={80} 
                      paddingAngle={5} 
                      dataKey="value"
                    >
                      <Cell fill="#6366f1" />
                      <Cell fill="#8b5cf6" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">AI Analyzed Ticket Queue</h3>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">LIVE SYNC ENABLED</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Ticket</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-slate-50 transition-all duration-300 group">
                        <td className="px-6 py-4 text-xs font-mono font-bold text-slate-400">{ticket.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-800">{ticket.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{ticket.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">{ticket.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            ticket.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                            <span className={`w-2 h-2 rounded-full shadow-sm ${
                              ticket.status === 'OPEN' ? 'bg-green-500' : 
                              ticket.status === 'RESOLVED' ? 'bg-indigo-500' :
                              ticket.status === 'CLOSED' ? 'bg-slate-400' :
                              'bg-amber-500'
                            }`}></span>
                            {ticket.status}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <TicketForm onTicketCreated={(t) => setTickets([t, ...tickets])} />
            <Chatbot />
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              </div>
              <h4 className="font-bold text-sm mb-3 text-indigo-300 uppercase tracking-widest relative z-10">Project Intelligence</h4>
              <ul className="text-xs space-y-3 text-slate-300 relative z-10">
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">WS</span>
                  <span><b>Real-time Engine:</b> Implemented via simulated WebSockets (Django Channels in prod) for status updates.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">ML</span>
                  <span><b>Categorization:</b> Automated multi-class logic with Gemini reasoning fallbacks.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">FB</span>
                  <span><b>Self-Healing:</b> Integrated feedback loop enables manual override for continuous learning.</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between relative z-10">
                <div className="text-[10px] text-slate-500">SYSTEM ARCHITECTURE V2.0</div>
                <div className="bg-green-600/20 text-green-400 px-3 py-1 rounded text-[10px] font-bold border border-green-600/30">WS: LISTENING</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
