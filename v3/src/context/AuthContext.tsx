
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { User } from '../types';

// Mock User type removed, imported from types instead

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<boolean>;
    signup: (name: string, email: string, pass: string) => Promise<boolean>;
    createAdmin: (name: string, email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            localStorage.setItem('auth_user', JSON.stringify(updated));
            return updated;
        });
    };

    const signup = async (name: string, email: string, pass: string): Promise<boolean> => {
        // Artificial Delay
        await new Promise(r => setTimeout(r, 800));

        const newUser: User = {
            id: `usr_${Date.now()}`,
            name: name,
            email: email,
            role: 'USER',
            avatar: undefined
        };

        setUser(newUser);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        return true;
    };

    const createAdmin = async (name: string, email: string, pass: string): Promise<boolean> => {
        // Only allow if current user is SUPERUSER
        if (user?.role !== 'SUPERUSER') return false;

        // Artificial Delay
        await new Promise(r => setTimeout(r, 800));

        // In a real backend, we'd send this to the API.
        // For this mock, we can't easily persist "other" users in valid state without a real DB.
        // But we can simulate success.
        console.log(`[Mock] Created Admin: ${email}`);
        return true;
    };

    const login = async (email: string, pass: string): Promise<boolean> => {
        // Artificial Delay
        await new Promise(r => setTimeout(r, 800));

        // Simple Mock Logic
        if (email === 'admin@company.com' && pass === 'admin') {
            const mockUser: User = {
                id: 'usr_001',
                name: 'Senior Engineer',
                email: email,
                role: 'ADMIN',
                avatar: undefined
            };
            setUser(mockUser);
            localStorage.setItem('auth_user', JSON.stringify(mockUser));
            return true;
        } else if (email === 'student@college.edu' && pass === 'user') {
            const mockUser: User = {
                id: 'usr_002',
                name: 'Alex Student',
                email: email,
                role: 'USER',
                avatar: undefined
            };
            setUser(mockUser);
            localStorage.setItem('auth_user', JSON.stringify(mockUser));
            return true;
        } else if (email === 'superuser@company.com' && pass === 'super') {
            const mockUser: User = {
                id: 'usr_000',
                name: 'System Root',
                email: email,
                role: 'SUPERUSER',
                avatar: undefined
            };
            setUser(mockUser);
            localStorage.setItem('auth_user', JSON.stringify(mockUser));
            return true;
        }

        // Allow demo login for newly signed up users if we had persistent list,
        // but for now only predefined + auto-login on signup works.
        // Let's add a generic catch-all for testing if needed, or strict.
        // For this demo, we can assume if they don't match hardcoded, they fail login
        // (unless they just signed up, which would set state directly).
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, createAdmin, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
