
const API_BASE = 'http://localhost:8000/api';

export const draftReplyFromAI = async (ticketId: string): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE}/tickets/${ticketId}/draft_reply/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add Authorization header here if needed for protected endpoint
            }
        });

        if (!response.ok) {
            throw new Error('Failed to generate draft');
        }

        const data = await response.json();
        return data.draft;
    } catch (error) {
        console.error("Draft Generation Error:", error);
        return "Error generating draft. Please check console.";
    }
};
