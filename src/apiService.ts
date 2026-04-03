
// Dynamically determine the API URL based on the current window location
// This ensures that if the user visits via 192.168.x.x, the API calls go to 192.168.x.x:8000
const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;

// Update signature to accept object
export const draftReplyFromAI = async (ticket: { id?: string, title: string, description: string, history?: string }): Promise<string> => {
    try {
        // Post to collection URL
        const response = await fetch(`${API_BASE}/tickets/draft_reply/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticket_id: ticket.id,
                title: ticket.title,
                description: ticket.description,
                history: ticket.history || ''
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Server Error (${response.status}): ${text}`);
        }

        const data = await response.json();
        return data.draft;
    } catch (error: any) {
        console.error("Draft Generation Error:", error);
        return `Error: ${error.message || "Unknown Network Error"}`;
    }
};

export const sendReply = async (ticketId: string, content: string): Promise<any> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/send_reply/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server Error (${response.status}): ${text}`);
    }

    return response.json();
};

export const fetchTickets = async (): Promise<any[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No auth token found. Please login.");

    const response = await fetch(`${API_BASE}/tickets/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (response.status === 401) {
        // Token expired or invalid
        throw new Error("Session expired. Please logout and login again.");
    }
    if (!response.ok) throw new Error("Failed to fetch tickets");
    return response.json();
};

export const createTicket = async (ticketData: any): Promise<any> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No auth token found. Please login.");

    const response = await fetch(`${API_BASE}/tickets/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ticketData)
    });

    if (response.status === 401) {
        window.dispatchEvent(new Event('auth:logout'));
        throw new Error("Session expired. Please logout and login again.");
    }

    if (!response.ok) {
        const text = await response.text();
        console.error("Create Ticket Failed:", response.status, text);
        throw new Error(`Failed to create ticket: ${response.status} ${text}`);
    }
    return response.json();
};

export const updateTicketStatus = async (id: string, status: string): Promise<any> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/tickets/${id}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error("Failed to update ticket");
    return response.json();
};
