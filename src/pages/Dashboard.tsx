import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, TicketPriority, TicketStatus } from '../types';
import { useTicketWebSocket } from '../aiService';
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
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch tickets from API
    useEffect(() => {
        const loadTickets = async () => {
            try {
                // Dynamically import to use the new function
                const { fetchTickets } = await import('../apiService');
                const data = await fetchTickets();
                // Map backend fields to frontend model if necessary
                const mapped = data.map((t: any) => ({
                    id: t.id.toString(),
                    title: t.title,
                    description: t.description,
                    priority: t.priority,
                    status: t.status,
                    category: t.category_name || t.category || 'General',
                    createdAt: t.created_at,
                    userId: t.created_by?.id?.toString() || 'unknown',
                    createdBy: t.created_by?.username || 'Unknown',
                    aiSuggestedSolution: t.ai_suggested_solution
                }));
                setTickets(mapped);
            } catch (err) {
                console.error("Failed to fetch tickets", err);
            } finally {
                setLoading(false);
            }
        };
        loadTickets();
    }, []); // Run once on mount

    // Handle WebSocket/Polling updates (Simplified for now)
    const handleWebSocketUpdate = useCallback((payload: any) => {
        // Implement real-time update logic here
    }, []);
    const { simulateStatusUpdate } = useTicketWebSocket(handleWebSocketUpdate);

    // --- HANDLERS ---

    const handleTicketMoved = async (ticketId: string, newStatus: TicketStatus) => {
        // Optimistic Update
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, status: newStatus } : t
        ));

        try {
            const { updateTicketStatus } = await import('../apiService');
            await updateTicketStatus(ticketId, newStatus);
        } catch (e) {
            console.error("Failed to update status", e);
            // Revert on failure could be implemented here
        }
    };

    const handleTicketUpsert = async (ticketData: any) => {
        try {
            const { createTicket } = await import('../apiService');
            // Pass full data including priority/category
            const newTicket = await createTicket({
                title: ticketData.title,
                description: ticketData.description,
                priority: ticketData.priority,
                category: ticketData.category,
                status: ticketData.status || 'OPEN'
            });

            // Re-fetch or append
            const mapped = {
                id: newTicket.id.toString(),
                title: newTicket.title,
                description: newTicket.description,
                priority: newTicket.priority,
                status: newTicket.status,
                category: newTicket.category_name || 'General',
                createdAt: newTicket.created_at,
                userId: user?.id || 'unknown',
                createdBy: user?.name || 'Unknown',
                aiSuggestedSolution: newTicket.ai_suggested_solution
            };

            setTickets(prev => [mapped, ...prev]);
            setTickets(prev => [mapped, ...prev]);
        } catch (e: any) {
            console.error(e);
            alert(`Failed to create ticket: ${e.message}`);
        }
    };

    const handleTicketFeedback = (ticketId: string, rating: 'helpful' | 'not_helpful') => {
        // Implement API call
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, aiFeedbackRating: rating } : t
        ));
    };

    const handleAcceptSolution = (ticketId: string) => {
        // Implement API call to close ticket
        handleTicketMoved(ticketId, TicketStatus.RESOLVED);
    };

    if (loading) {
        return <div className="p-10 text-center">Loading tickets...</div>;
    }

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
