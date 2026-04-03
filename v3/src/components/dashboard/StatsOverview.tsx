import React from 'react';
import { Ticket } from '../../types';

interface StatsOverviewProps {
    tickets: Ticket[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ tickets }) => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'OPEN').length;
    const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter(t => t.status === 'RESOLVED').length;

    const stats = [
        { label: 'Total Tickets', value: total, icon: '📊', color: 'bg-indigo-50 text-indigo-700' },
        { label: 'Open', value: open, icon: '📂', color: 'bg-slate-100 text-slate-700' },
        { label: 'In Progress', value: inProgress, icon: '⚡', color: 'bg-amber-50 text-amber-600' },
        { label: 'Resolved', value: resolved, icon: '✅', color: 'bg-green-50 text-green-700' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                        {stat.icon}
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
