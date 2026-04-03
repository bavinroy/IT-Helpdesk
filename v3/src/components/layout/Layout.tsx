import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { User } from '../../types';

interface LayoutProps {
    user: User | null;
    children: React.ReactNode;
    onLogout: () => void;
    activePage?: string;
    setActivePage?: (page: string) => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
    user,
    children,
    onLogout,
    activePage: propActivePage,
    setActivePage: propSetActivePage,
    searchQuery = '',
    onSearchChange = () => { }
}) => {
    // Local state for sidebar visibility on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Manage active page internally if not controlled
    const [page, setPage] = useState('dashboard');

    const activePage = propActivePage || page;
    const setActivePage = propSetActivePage || setPage;

    if (!user) return <>{children}</>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
            <TopBar
                user={user}
                onLogout={onLogout}
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                onProfileClick={() => setActivePage('profile')}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
            />

            <Sidebar
                role={user.role}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                activePage={activePage}
                setActivePage={setActivePage}
            />

            <main className="pt-20 lg:pl-64 p-6 transition-all duration-300">
                <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
};
