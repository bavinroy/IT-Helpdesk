import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, LayoutGrid, List, Camera, User as UserIcon, Trash2, Shield, X, Check } from 'lucide-react';
import { Ticket, User, TicketStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { TicketForm } from '../TicketForm';
import { Chatbot } from '../Chatbot';
import { KanbanBoard } from '../KanbanBoard';
import { Layout } from '../layout/Layout';
import { StatsOverview } from './StatsOverview';

interface AdminDashboardProps {
    user: User;
    tickets: Ticket[];
    notifications: { id: number, msg: string }[];
    onLogout: () => void;
    onTicketCreate: (ticket: Ticket) => void;
    onTicketMoved: (ticketId: string, newStatus: TicketStatus) => void;
    onAcceptSolution: (ticketId: string) => void;
    onTicketFeedback: (ticketId: string, rating: 'helpful' | 'not_helpful') => void;
    onTriggerSimulate: () => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    user,
    tickets,
    notifications,
    onLogout,
    onTicketCreate,
    onTicketMoved,
    onAcceptSolution,
    onTicketFeedback,
    onTriggerSimulate
}) => {
    const { updateUser, createAdmin } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [newAdminName, setNewAdminName] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPass, setNewAdminPass] = useState('');
    const [adminMsg, setAdminMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ avatar: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesCategory = filterCategory ? t.category === filterCategory : true;
        const matchesSearch = searchQuery
            ? (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.id.toLowerCase().includes(searchQuery.toLowerCase()))
            : true;
        return matchesCategory && matchesSearch;
    });

    const stats = [
        { name: 'Hardware', value: tickets.filter(t => t.category === 'Hardware').length },
        { name: 'Network', value: tickets.filter(t => t.category === 'Network').length },
        { name: 'Software', value: tickets.filter(t => t.category === 'Software').length },
        { name: 'Access', value: tickets.filter(t => t.category === 'Access').length },
    ];

    const renderContent = () => {
        switch (activePage) {
            case 'all-tickets':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">All Tickets</h2>
                            <span className="text-slate-500 dark:text-slate-400 text-sm">{tickets.length} total tickets</span>
                        </div>
                        {/* Reuse the list/board view logic here if desired, or just a table */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex gap-4">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    List View
                                </button>
                                <button
                                    onClick={() => setViewMode('board')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'board' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    Kanban Board
                                </button>
                            </div>
                            {viewMode === 'list' ? (
                                <div className="p-4">
                                    {/* Simplified Table Reuse Logic - In a real app, extract TicketList component */}
                                    <KanbanBoard tickets={tickets} onTicketMoved={onTicketMoved} />
                                    {/* Using Kanban for now as the 'Table' logic is buried in dashboard view. Real refactor would extract Table. */}
                                    {/* Actually, let's just show the board for 'All Tickets' page for now as it's powerful, or specific table */}
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 text-center">
                                    <KanbanBoard tickets={tickets} onTicketMoved={onTicketMoved} />
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'priority':
                const priorityTickets = tickets.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL');
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                            Priority Queue
                        </h2>
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            {priorityTickets.length === 0 ? (
                                <p className="text-slate-500 dark:text-slate-400 text-center py-8">No high priority tickets pending. Good job!</p>
                            ) : (
                                <KanbanBoard tickets={priorityTickets} onTicketMoved={onTicketMoved} />
                            )}
                        </div>
                    </div>
                );

            case 'users':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h2>
                            {user.role === 'SUPERUSER' && (
                                <button
                                    onClick={() => setShowCreateAdmin(!showCreateAdmin)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-bold shadow-lg shadow-indigo-600/20"
                                >
                                    {showCreateAdmin ? <X className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                    {showCreateAdmin ? 'Cancel' : 'Create Admin'}
                                </button>
                            )}
                        </div>

                        {/* Create Admin Form (Superuser Only) */}
                        {showCreateAdmin && user.role === 'SUPERUSER' && (
                            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xl border border-indigo-500/30 animate-in slide-in-from-top-4">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-400" />
                                    New Administrator
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">Full Name</label>
                                        <input
                                            type="text"
                                            value={newAdminName}
                                            onChange={(e) => setNewAdminName(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Admin Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">Email</label>
                                        <input
                                            type="email"
                                            value={newAdminEmail}
                                            onChange={(e) => setNewAdminEmail(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="admin@company.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">Password</label>
                                        <input
                                            type="password"
                                            value={newAdminPass}
                                            onChange={(e) => setNewAdminPass(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="••••••"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm ${adminMsg.includes('Success') ? 'text-green-400' : 'text-slate-400'}`}>
                                        {adminMsg || 'New admin will have full system access.'}
                                    </p>
                                    <button
                                        onClick={async () => {
                                            if (!newAdminName || !newAdminEmail || !newAdminPass) {
                                                setAdminMsg('Please fill all fields.');
                                                return;
                                            }
                                            if (createAdmin) {
                                                await createAdmin(newAdminName, newAdminEmail, newAdminPass);
                                                setAdminMsg(`Success! Created admin: ${newAdminEmail}`);
                                                setNewAdminName('');
                                                setNewAdminEmail('');
                                                setNewAdminPass('');
                                                setTimeout(() => {
                                                    setShowCreateAdmin(false);
                                                    setAdminMsg('');
                                                }, 2000);
                                            }
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {['Alice Employee', 'Bob Manager', 'Charlie Dev'].map((u, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{u}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">User</td>
                                            <td className="px-6 py-4"><span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-bold">Active</span></td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">2 mins ago</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'reports':
                return (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <Activity className="w-8 h-8 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Reports Module</h2>
                        <p className="text-slate-500 max-w-md">Advanced analytics and CSV export capabilities are coming in the next update.</p>
                    </div>
                );

            case 'profile':
                return (
                    <div className="max-w-xl mx-auto space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Profile</h2>
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center">

                            {/* Editable Avatar */}
                            <div
                                className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        className="w-full h-full rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-xl"
                                        alt="Profile"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-full flex items-end justify-center overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 shadow-xl">
                                        <UserIcon className="w-24 h-24 text-white dark:text-slate-400 -mb-3" fill="currentColor" />
                                    </div>
                                )}

                                {user.avatar && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            updateUser({ avatar: undefined });
                                        }}
                                        className="absolute bottom-1 left-1 bg-red-500 hover:bg-red-600 rounded-full p-2 shadow-lg border-2 border-white dark:border-slate-900 transition-colors z-10"
                                        title="Remove Photo"
                                    >
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                )}

                                <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                    <Camera className="w-8 h-8 text-white mb-1" />
                                    <span className="text-white text-xs font-medium">Change Photo</span>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-indigo-600 rounded-full p-2 shadow-lg border-2 border-white dark:border-slate-900 group-hover:scale-110 transition-transform">
                                    <Camera className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user.name}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">{user.role}</p>

                            <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold">Admin ID</label>
                                    <p className="font-mono text-sm dark:text-white">{user.id || 'ADM-001'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold">Access Level</label>
                                    <p className="text-sm dark:text-white">Full System Access</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold">Email</label>
                                    <p className="text-sm dark:text-white">admin@company.com</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold">Region</label>
                                    <p className="text-sm dark:text-white">US-East</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'dashboard':
            default:
                return (
                    <div className="flex flex-col gap-8">
                        {/* Header Actions */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Overview of system performance and ticket queue</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onTriggerSimulate}
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2 group"
                                >
                                    <Activity className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                                    Trigger Socket Test
                                </button>
                                <span className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    WS: Live
                                </span>
                            </div>
                        </div>

                        {/* Stats Overview */}
                        <StatsOverview tickets={tickets} />

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 space-y-8">

                                {/* Charts Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-[300px]">
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                            <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                                            Categorization
                                        </h3>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" />
                                                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{
                                                        borderRadius: '12px',
                                                        border: '1px solid #334155',
                                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                                                        backgroundColor: '#1e293b',
                                                        color: '#fff'
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    radius={[6, 6, 0, 0]}
                                                    onClick={(data) => setFilterCategory(data.name === filterCategory ? null : data.name)}
                                                    cursor="pointer"
                                                >
                                                    {stats.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={filterCategory === entry.name ? '#4f46e5' : COLORS[index % COLORS.length]}
                                                            opacity={filterCategory && filterCategory !== entry.name ? 0.3 : 1}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-[300px]">
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                            <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                                            Status Distribution
                                        </h3>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Open', value: tickets.filter(t => t.status === 'OPEN').length },
                                                        { name: 'Active', value: tickets.filter(t => t.status === 'IN_PROGRESS').length },
                                                        { name: 'Resolved', value: tickets.filter(t => t.status === 'RESOLVED').length }
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
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid #334155',
                                                        backgroundColor: '#1e293b',
                                                        color: '#fff'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Ticket View Area */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Tickets Queue</h3>
                                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                            >
                                                <List className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('board')}
                                                className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                            >
                                                <LayoutGrid className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {viewMode === 'list' ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-black text-slate-400">
                                                    <tr>
                                                        <th className="px-6 py-4">ID</th>
                                                        <th className="px-6 py-4">Ticket</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {filteredTickets.map(ticket => (
                                                        <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group">
                                                            <td className="px-6 py-4 text-xs font-mono font-bold text-slate-400">{ticket.id}</td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${ticket.priority === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                                                        ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                                                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                                        }`}>
                                                                        {ticket.priority}
                                                                    </span>
                                                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">{ticket.category}</span>
                                                                </div>
                                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">{ticket.title}</p>
                                                                {ticket.aiSuggestedSolution && (
                                                                    <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                                                        <span className="font-bold">✨ AI Suggestion:</span> {ticket.aiSuggestedSolution}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${ticket.status === 'OPEN' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                                                    ticket.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                                        ticket.status === 'RESOLVED' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                                            'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                                                                    }`}>
                                                                    {ticket.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex gap-2">
                                                                    {ticket.aiSuggestedSolution && ticket.status !== 'RESOLVED' && (
                                                                        <button
                                                                            onClick={() => onAcceptSolution(ticket.id)}
                                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                                                        >
                                                                            Accept AI
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            const btn = e.target as HTMLButtonElement;
                                                                            const originalText = btn.innerText;
                                                                            btn.innerText = "Drafting...";
                                                                            btn.disabled = true;

                                                                            // Import dynamically to avoid circular deps if any, or just standard import
                                                                            // Ideally we pass this via props but for quick demo:
                                                                            const { draftReplyFromAI } = await import('../../apiService');
                                                                            const draft = await draftReplyFromAI(ticket.id);
                                                                            alert(`AI Draft Reply:\n\n${draft}`);

                                                                            btn.innerText = originalText;
                                                                            btn.disabled = false;
                                                                        }}
                                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1"
                                                                    >
                                                                        Auto-Reply
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-100 dark:bg-slate-800">
                                            <KanbanBoard tickets={filteredTickets} onTicketMoved={onTicketMoved} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Manual Entry</h2>
                                    <TicketForm onTicketCreated={onTicketCreate} />
                                </div>
                                <Chatbot onCreateTicket={onTicketCreate} />

                                {/* System Status Card */}
                                <div className="bg-slate-900 rounded-xl p-6 text-white overflow-hidden relative">
                                    <div className="relative z-10">
                                        <h4 className="font-bold text-sm text-indigo-400 uppercase tracking-widest mb-4">System Intelligence</h4>
                                        <div className="space-y-3 font-mono text-xs text-slate-300">
                                            <div className="flex justify-between">
                                                <span>Engine Status</span>
                                                <span className="text-green-400">ONLINE</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>ML Model</span>
                                                <span className="text-indigo-400">Llama 3 8b</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Latency</span>
                                                <span className="text-indigo-400">24ms</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Background decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Layout
            user={user}
            onLogout={onLogout}
            activePage={activePage}
            setActivePage={setActivePage}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
        >
            {/* Real-time Notifications Toast */}
            {notifications.length > 0 && (
                <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
                    {notifications.map(n => (
                        <div key={n.id} className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce pointer-events-auto">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium">{n.msg}</span>
                        </div>
                    ))}
                </div>
            )}

            {renderContent()}
        </Layout>
    );
};
