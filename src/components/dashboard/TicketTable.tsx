import React from 'react';
import { Ticket, TicketPriority, TicketStatus } from '../../types';
import { AlertCircle, CheckCircle, Clock, Circle } from 'lucide-react';

interface TicketTableProps {
    tickets: Ticket[];
    onTicketClick?: (ticketId: string) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({ tickets, onTicketClick }) => {

    // Helper for Status Badge
    const getStatusBadge = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.OPEN:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"><Circle className="w-3 h-3 fill-current" /> Open</span>;
            case TicketStatus.IN_PROGRESS:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><Clock className="w-3 h-3" /> In Progress</span>;
            case TicketStatus.RESOLVED:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"><CheckCircle className="w-3 h-3" /> Resolved</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">Closed</span>;
        }
    };

    // Helper for Priority Badge
    const getPriorityBadge = (priority: TicketPriority) => {
        switch (priority) {
            case TicketPriority.HIGH:
            case TicketPriority.CRITICAL:
                return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">High</span>;
            case TicketPriority.MEDIUM:
                return <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">Medium</span>;
            default:
                return <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Low</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {tickets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-600 text-sm">
                                    No tickets found.
                                </td>
                            </tr>
                        ) : (
                            tickets.map(ticket => (
                                <tr
                                    key={ticket.id}
                                    onClick={() => onTicketClick && onTicketClick(ticket.id)}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-500">#{ticket.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{ticket.title}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{ticket.category}</td>
                                    <td className="px-6 py-4">{getPriorityBadge(ticket.priority)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-500">
                                        {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
