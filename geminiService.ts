
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Simulation of the ML Inference Module for Ticket Analysis
export const analyzeTicketWithAI = async (title: string, description: string) => {
  const prompt = `Analyze this IT ticket and return categorization data.
  Ticket Title: ${title}
  Description: ${description}
  
  Possible Categories: Hardware, Software, Network, Access, Email.
  Possible Priorities: LOW, MEDIUM, HIGH, CRITICAL.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "One of the provided categories" },
          priority: { type: Type.STRING, description: "Predicted priority based on impact" },
          reasoning: { type: Type.STRING, description: "Why this classification was chosen" },
          suggestedSolution: { type: Type.STRING, description: "A technical solution for IT staff" }
        },
        required: ["category", "priority", "suggestedSolution"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const chatWithBot = async (history: { role: string, parts: any[] }[], userInput: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an intelligent IT Helpdesk Chatbot. 
      Your goal is to help users solve common IT issues (Password Reset, VPN, Email, Software installs).
      If the issue sounds complex (hardware failure, security breach), ask if they want to raise a formal ticket.
      Maintain a professional, helpful tone. Be concise.`
    }
  });

  const response = await chat.sendMessage({ message: userInput });
  return response.text;
};

/**
 * WebSocket Simulation Hook for Real-time Updates
 * In a real production environment (Django Channels), this would connect 
 * to ws://backend-url/ws/tickets/
 */
export const useTicketWebSocket = (onUpdate: (data: any) => void) => {
  // Simulate incoming status updates from backend
  const simulateStatusUpdate = () => {
    const statuses = ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // We send a mock update payload
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
