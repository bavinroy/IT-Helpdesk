import React from 'react';
import { Search, LogOut, Menu, User as UserIcon, Moon, Sun } from 'lucide-react';
import { User } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface TopBarProps {
    user: User | null;
    onLogout: () => void;
    onMenuClick: () => void;
    onProfileClick: () => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    user,
    onLogout,
    onMenuClick,
    onProfileClick,
    searchQuery = '',
    onSearchChange = () => { }
}) => {
    const { theme, toggleTheme } = useTheme();

    // Listen for custom logout event
    React.useEffect(() => {
        const handleAuthError = () => {
            console.log("Session expired event received. Logging out.");
            onLogout();
        };
        window.addEventListener('auth:logout', handleAuthError);
        return () => window.removeEventListener('auth:logout', handleAuthError);
    }, [onLogout]);

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed top-0 w-full z-40 px-4 lg:px-6 flex items-center justify-between shadow-sm dark:shadow-slate-900/50 transition-colors">
            {/* Left: Logo & Menu */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <span className="text-white font-bold text-lg">H</span>
                    </div>
                    <span className="font-bold text-lg text-slate-800 dark:text-slate-100 hidden sm:block">Smart Helpdesk</span>
                </div>
            </div>

            {/* Center: Search (Hidden) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            </div>

            {/* Right: Profile & Theme */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'Guest'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user?.role || 'Visitor'}</p>
                    </div>
                    <div className="relative group cursor-pointer">
                        {user?.avatar ? (
                            <img src={user.avatar} className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm object-cover" alt="Avatar" />
                        ) : (
                            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-end justify-center overflow-hidden ring-2 ring-white dark:ring-slate-800">
                                <UserIcon className="w-8 h-8 text-white dark:text-slate-400 -mb-1" fill="currentColor" />
                            </div>
                        )}

                        {/* Logout Dropdown */}
                        <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-100 dark:border-slate-800 py-2">
                                <button
                                    onClick={onProfileClick}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    View Profile
                                </button>
                                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
