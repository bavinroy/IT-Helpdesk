
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
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        } else {
            // Invalid state (user but no token, or vice versa)
            localStorage.removeItem('auth_user');
            localStorage.removeItem('token');
            setUser(null);
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

    const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;

    const signup = async (name: string, email: string, pass: string): Promise<boolean> => {
        try {
            // 1. Register
            const response = await fetch(`${API_BASE}/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: email, // Using email as username
                    email: email,
                    password: pass,
                    first_name: name
                })
            });

            if (!response.ok) {
                const text = await response.text();
                // Parse error similarly to login
                let errorMessage;
                try {
                    const json = JSON.parse(text);
                    // DRF often returns { "username": ["Error"] }
                    const firstKey = Object.keys(json)[0];
                    const firstVal = json[firstKey];
                    errorMessage = Array.isArray(firstVal) ? `${firstKey}: ${firstVal[0]}` : (json.detail || text);
                } catch {
                    errorMessage = text;
                }
                throw new Error(errorMessage);
            }

            // 2. Auto Login to get Token
            return await login(email, pass);

        } catch (e) {
            console.error("Signup Error:", e);
            throw e;
        }
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
        try {
            const response = await fetch(`${API_BASE}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password: pass })
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("Login Failed:", response.status, text);

                let errorMessage;
                try {
                    const json = JSON.parse(text);
                    errorMessage = json.detail || json.error || text;
                } catch {
                    errorMessage = text;
                }

                throw new Error(`${response.status}: ${errorMessage}`);
            }

            const data = await response.json();

            // Map Backend User to Frontend User
            const user: User = {
                id: data.user_id, // Ensure your backend login serialization includes user info or decode token
                name: data.name || email.split('@')[0], // Fallback if backend doesn't send name
                email: email,
                role: data.role || 'USER', // 'ADMIN', 'USER', etc
                avatar: undefined
            };

            // Store Token
            localStorage.setItem('token', data.access);
            localStorage.setItem('auth_user', JSON.stringify(user));
            setUser(user);
            return true;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('token');
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
