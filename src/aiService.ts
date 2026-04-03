import { TicketPriority } from './types';

// Define the shape of the response we want
interface AIAnalysisResult {
  category: string;
  priority: TicketPriority;
  reasoning: string;
  suggestedSolution: string;
}

import { API_BASE } from './config';


/**
 * Call Backend AI Service for Ticket Analysis
 */
export const analyzeTicketWithAI = async (title: string, description: string): Promise<AIAnalysisResult | null> => {
  try {
    const response = await fetch(`${API_BASE}/tickets/analyze/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      throw new Error('Backend analysis failed');
    }

    const data = await response.json();
    return {
      category: data.category || 'General',
      priority: data.priority as TicketPriority || TicketPriority.MEDIUM,
      reasoning: data.reasoning || 'Authorized by automated AI triage.',
      suggestedSolution: data.suggestedSolution || ''
    };
  } catch (error) {
    console.warn("AI Analysis offline:", error);
    // Fallback if backend is unreachable
    return {
      category: "General",
      priority: TicketPriority.MEDIUM,
      reasoning: "AI Service Unavailable",
      suggestedSolution: ""
    };
  }
};

/**
 * Call Backend Chatbot
 */
export const chatWithBot = async (history: { role: string, parts: any[] }[], userInput: string) => {
  try {
    // We send just the latest message for now as our Backend View checks "message" body param.
    // Enhanced backend could accept history.
    const response = await fetch(`${API_BASE}/chatbot/message/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userInput })
    });

    if (!response.ok) {
      throw new Error('Chatbot backend error');
    }

    const data = await response.json();
    return data.reply;

  } catch (error: any) {
    console.error("Chatbot Error:", error);
    return `Connection Error: ${error.message || "Unknown error"}`;
  }
};

export const useTicketWebSocket = (onUpdate: (data: any) => void) => {
  // Simulate incoming status updates from backend
  const simulateStatusUpdate = () => {
    const statuses = ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    onUpdate({
      type: 'TICKET_STATUS_CHANGED',
      data: {
        timestamp: new Date().toISOString(),
        status: randomStatus
      }
    });
  };

  return { simulateStatusUpdate };
};
