import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, TicketPriority, TicketStatus } from '../types';
import { useTicketWebSocket } from '../geminiService';
import { useAuth } from '../context/AuthContext';
import { UserDashboard } from '../components/dashboard/UserDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';

// Mock initial data if localStorage is empty
const MOCK_INITIAL_TICKETS: Ticket[] = [
    {
        id: 'TK-882',
        title: 'VPN Connection Failure',
        description: 'Unable to connect to the corporate VPN from home network.',
        category: 'Network',
        priority: TicketPriority.HIGH,
        status: TicketStatus.OPEN,
        createdAt: new Date().toISOString(),
        userId: 'user1',
        createdBy: 'Alice Employee'
    },
    {
        id: 'TK-883',
        title: 'Keyboard Keys Sticking',
        description: 'The "E" and "R" keys on my laptop keyboard are unresponsive.',
        category: 'Hardware',
        priority: TicketPriority.LOW,
        status: TicketStatus.IN_PROGRESS,
        createdAt: new Date().toISOString(),
        userId: 'user1',
        createdBy: 'Alice Employee'
    }
];

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState<{ id: number, msg: string }[]>([]);

    // 4️⃣ TICKET STORAGE USING localStorage
    // Initialize tickets from localStorage or fall back to mock data
    const [tickets, setTickets] = useState<Ticket[]>(() => {
        const saved = localStorage.getItem('app_tickets');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse tickets", e);
            }
        }
        return MOCK_INITIAL_TICKETS;
    });

    // Save tickets to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('app_tickets', JSON.stringify(tickets));
    }, [tickets]);

    // Handle incoming "WebSocket" updates
    const handleWebSocketUpdate = useCallback((payload: any) => {
        if (payload.type === 'TICKET_STATUS_CHANGED') {
            setTickets(prev => {
                if (prev.length === 0) return prev;
                const randomIndex = Math.floor(Math.random() * prev.length);
                const updated = [...prev];
                const oldStatus = updated[randomIndex].status;
                updated[randomIndex] = {
                    ...updated[randomIndex],
                    status: payload.data.status
                };

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

    // Auto-save logic is handled by the useEffect above, but we also emulate the 'socket' trigger
    // running periodically if desired. For now, we keep it manual or low freq.
    useEffect(() => {
        const interval = setInterval(simulateStatusUpdate, 30000); // Less frequent
        return () => clearInterval(interval);
    }, [simulateStatusUpdate]);


    // --- HANDLERS ---

    const handleTicketMoved = (ticketId: string, newStatus: TicketStatus) => {
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, status: newStatus } : t
        ));
    };

    const handleTicketUpsert = (ticket: Ticket) => {
        setTickets(prev => {
            const exists = prev.find(t => t.id === ticket.id);
            if (exists) {
                return prev.map(t => t.id === ticket.id ? ticket : t);
            }
            // New ticket
            // 5️⃣ USER TICKET CREATION IMPROVEMENT (Defaults)
            // Ensure defaults are set if missing (though TicketForm usually handles this)
            const newTicket = {
                ...ticket,
                status: ticket.status || TicketStatus.OPEN,
                priority: ticket.priority || TicketPriority.MEDIUM,
                createdBy: user?.name || 'Unknown User',
                userId: user?.id || 'unknown'
            };
            return [newTicket, ...prev];
        });
    };

    const handleTicketFeedback = (ticketId: string, rating: 'helpful' | 'not_helpful') => {
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, aiFeedbackRating: rating } : t
        ));
    };

    const handleAcceptSolution = (ticketId: string) => {
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? {
                ...t,
                status: TicketStatus.RESOLVED,
                resolutionNotes: 'Resolved via AI Recommendation'
            } : t
        ));
    };

    // --- RENDER ---

    // 2️⃣ ROLE-BASED DASHBOARD SPLIT
    if (user?.role === 'USER') {
        return (
            <UserDashboard
                user={user}
                tickets={tickets}
                onLogout={logout}
                onCreateTicket={handleTicketUpsert}
                onTicketFeedback={handleTicketFeedback}
            />
        );
    }

    // Default to Admin view
    return (
        <AdminDashboard
            user={user!}
            tickets={tickets}
            notifications={notifications}
            onLogout={logout}
            onTicketCreate={handleTicketUpsert}
            onTicketMoved={handleTicketMoved}
            onAcceptSolution={handleAcceptSolution}
            onTicketFeedback={handleTicketFeedback}
            onTriggerSimulate={simulateStatusUpdate}
        />
    );
};

export default Dashboard;
