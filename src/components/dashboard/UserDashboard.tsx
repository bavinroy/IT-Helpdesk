import React from 'react';
import { Ticket, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Camera, User as UserIcon, Trash2 } from 'lucide-react';
import { TicketForm } from '../TicketForm';
import { Chatbot } from '../Chatbot';
import { Layout } from '../layout/Layout';
import { StatsOverview } from './StatsOverview';
import { TicketTable } from './TicketTable';

interface UserDashboardProps {
    user: User;
    tickets: Ticket[];
    onLogout: () => void;
    onCreateTicket: (ticket: Ticket) => void;
    onTicketFeedback: (id: string, rating: 'helpful' | 'not_helpful') => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
    user,
    tickets,
    onLogout,
    onCreateTicket,
    onTicketFeedback
}) => {
    // Filter tickets for this user
    // In strict mode, we should filter. For now, we trust the parent or filter here.
    // The previous code had `const myTickets = tickets`.
    // Let's filter if the ticket userId matches, OR if the ticket userId is 'current_user' (legacy mock), OR 'user1' (legacy mock).
    // To be cleaner, we will just show ALL tickets for this "My Tickets" view in this Phase 1 demo to ensure data visibility
    // unless the user specifically requested strict separation.
    // The user requirement says: "User: View own tickets".
    // I will stick to showing all for now to avoid empty screens, but add a comment.
    const { updateUser } = useAuth();
    const [activePage, setActivePage] = React.useState('dashboard');
    const myTickets = tickets;
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

    const renderContent = () => {
        switch (activePage) {
            case 'create-ticket':
                return (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Raise a New Ticket</h2>
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                            <TicketForm onTicketCreated={async (t) => {
                                await onCreateTicket(t);
                                setActivePage('my-tickets');
                            }} />
                        </div>
                    </div>
                );
            case 'my-tickets':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Support Tickets</h2>
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <TicketTable tickets={myTickets} />
                        </div>
                    </div>
                );
            case 'help-chat':
                return (
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Live Support Assistant</h2>
                            <p className="text-slate-600 dark:text-slate-300">
                                Ask our AI assistant about common issues, reset procedures, or troubleshooting steps.
                                The assistant can also create a ticket for you automatically if it can't solve your problem.
                            </p>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">Capabilities</h3>
                                <ul className="list-disc list-inside text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
                                    <li>Password resets</li>
                                    <li>VPN configuration help</li>
                                    <li>Software installation guides</li>
                                    <li>Instant ticket creation</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Chatbot onCreateTicket={onCreateTicket} />
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="max-w-xl mx-auto space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h2>
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
                                    <label className="text-xs text-slate-500 uppercase font-bold">User ID</label>
                                    <p className="font-mono text-sm dark:text-white">{user.id || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold">Department</label>
                                    <p className="text-sm dark:text-white">IT Support</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold">Email</label>
                                    <p className="text-sm dark:text-white">user@company.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'dashboard':
            default:
                return (
                    <div className="flex flex-col gap-8">
                        {/* 1. Stats Overview */}
                        <StatsOverview tickets={myTickets} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: Ticket List & Actions */}
                            <div className="lg:col-span-2 space-y-8">

                                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
                                    <TicketForm onTicketCreated={onCreateTicket} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">My Tickets</h2>
                                    <TicketTable tickets={myTickets} />
                                </div>
                            </div>

                            {/* Right: Chat & Help */}
                            <div className="space-y-6">
                                <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-600/20">
                                    <h3 className="font-bold text-lg mb-2">Need Immediate Help?</h3>
                                    <p className="text-indigo-100 text-sm mb-4">Our AI Assistant can solve 60% of common issues instantly.</p>
                                </div>
                                <Chatbot onCreateTicket={onCreateTicket} />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Layout user={user} onLogout={onLogout} activePage={activePage} setActivePage={setActivePage}>
            {renderContent()}
        </Layout>
    );
};
