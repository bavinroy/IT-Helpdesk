import React, { useState } from 'react';
import {
    LayoutDashboard,
    Ticket as TicketIcon,
    MessageCircle,
    User as UserIcon,
    Settings,
    Users,
    FileText,
    AlertCircle,
    Menu,
    X,
    LogOut
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    role: UserRole;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    activePage: string;
    setActivePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, setIsOpen, activePage, setActivePage }) => {
    // Menu Items Definition
    const userItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'create-ticket', label: 'Raise Ticket', icon: TicketIcon },
        { id: 'my-tickets', label: 'My Tickets', icon: FileText },
        { id: 'kb', label: 'Knowledge Base', icon: Settings }, // Settings used temporarily as icon placeholder
        { id: 'help-chat', label: 'Help Chat', icon: MessageCircle },
        { id: 'profile', label: 'Profile', icon: UserIcon },
    ];

    const adminItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'all-tickets', label: 'All Tickets', icon: TicketIcon },
        { id: 'priority', label: 'Priority Tickets', icon: AlertCircle },
        { id: 'kb', label: 'Knowledge Base', icon: Settings },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'profile', label: 'Profile', icon: UserIcon },
    ];

    const items = (role === 'ADMIN' || role === 'SUPERUSER') ? adminItems : userItems;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
                w-64 transform transition-transform duration-300 z-30
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="py-6 px-4 space-y-2">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActivePage(item.id);
                                    if (window.innerWidth < 1024) setIsOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                    ${isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-center text-slate-400 dark:text-slate-600">
                        &copy; 2026 IT Helpdesk
                    </p>
                </div>
            </aside>
        </>
    );
};
