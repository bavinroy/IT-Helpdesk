import requests
import os
import json
import logging

# Configure Logging
logger = logging.getLogger(__name__)

class AIService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIService, cls).__new__(cls)
            cls._instance.initialize()
        return cls._instance

    def initialize(self):
        self.api_key = os.getenv('GROQ_API_KEY')
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model_name = "llama-3.3-70b-versatile"
        self.is_available = False
        
        if self.api_key:
            self.is_available = True
            logger.info("AIService initialized with Groq API.")
        else:
            logger.warning("GROQ_API_KEY not found. AI Service using fallback logic.")

    def _call_groq(self, messages, temperature=0.3):
        """
        Helper method to call Groq API
        """
        if not self.is_available:
            raise Exception("Groq API not configured")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data['choices'][0]['message']['content']
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            return None

    def analyze_ticket(self, title, description):
        """
        Analyzes ticket content to determine Category and Priority.
        Returns: { 'category': str, 'priority': str, 'reasoning': str, suggestedSolution: str }
        """
        if self.is_available:
            system_prompt = """
            You are an expert IT Helpdesk Triage AI.
            Analyze the following IT ticket.
            1. CATEGORIZE: (Hardware, Software, Network, Access, Email)
            2. PREDICT PRIORITY: Look for keywords like "exam", "deadline", "urgent" to assign HIGH/CRITICAL. Otherwise LOW/MEDIUM.
            3. SUGGEST SOLUTION: Provide a brief technical troubleshooting step.
            
            Return a JSON object with strictly these fields:
            - category: string
            - priority: (LOW, MEDIUM, HIGH, CRITICAL)
            - reasoning: string (Explain why this priority/category was chosen)
            - suggestedSolution: string
            
            Do not include markdown formatting (like ```json). Return raw JSON only.
            """
            
            user_prompt = f"Ticket Title: {title}\nDescription: {description}"
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            content = self._call_groq(messages)
            
            if content:
                try:
                    # Clean up potential markdown code blocks
                    clean_json = content.replace("```json", "").replace("```", "").strip()
                    return json.loads(clean_json)
                except Exception as e:
                    logger.error(f"Failed to parse Groq Analysis JSON: {e}")
                    # Keep going to fallback

        return self._fallback_analysis(title, description)

    def get_chat_response(self, message, history=[]):
        """
        Generates a chatbot response.
        """
        if self.is_available:
            system_prompt = """
            You are an intelligent IT Helpdesk Chatbot. 
            Your goal is to help users solve common IT issues (Password Reset, VPN, Email, Software installs).
            If the issue sounds complex (hardware failure, security breach), ask if they want to raise a formal ticket.
            Maintain a professional, helpful tone. Be concise.
            """
            
            # Simple context management: Prepend system prompt to current message
            # In a real app we would pass full history
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ]
            
            reply = self._call_groq(messages)
            
            if reply:
                return {
                    "reply": reply,
                    "suggest_create_ticket": "ticket" in reply.lower() or "support" in reply.lower()
                }
        
        return self._fallback_chat(message)

    def _fallback_analysis(self, title, description):
        text = (title + " " + description).lower()
        
        priority = 'MEDIUM'
        if 'urgent' in text or 'down' in text or 'hack' in text:
            priority = 'HIGH'
        if 'server' in text and 'down' in text:
            priority = 'CRITICAL'
            
        category = 'General'
        if 'wifi' in text or 'internet' in text: category = 'Network'
        elif 'printer' in text or 'laptop' in text: category = 'Hardware'
        elif 'password' in text or 'login' in text: category = 'Access'
        elif 'install' in text or 'software' in text: category = 'Software'

        return {
            "category": category,
            "priority": priority,
            "reasoning": "Keyword matching fallback (AI unavailable).",
            "suggestedSolution": "Please review manually."
        }

    def _fallback_chat(self, message):
        msg = message.lower()
        reply = "I'm not sure specifically. Please create a ticket."
        suggest = True

        if 'wifi' in msg:
            reply = "Try restarting your router."
        elif 'password' in msg:
            reply = "You can reset your password at /reset-password."
            suggest = False
        
    def generate_response(self, ticket_title, ticket_description, ticket_history_text=""):
        """
        Generates a draft response for a ticket based on its details and history.
        """
        if self.is_available:
            system_prompt = """
            You are a helpful IT Support Agent. 
            Draft a professional, concise, and technical response to the user's ticket.
            Your goal is to either provide a solution or ask for specific details needed to resolve it.
            Do not include placeholders like [Your Name]. Just the message body.
            """
            
            user_prompt = f"""
            Ticket Title: {ticket_title}
            Description: {ticket_description}
            
            History/Context:
            {ticket_history_text}
            
            Draft a reply:
            """
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            reply = self._call_groq(messages)
            if reply:
                return reply.strip()
                
        return "Thank you for your ticket. We are investigating the issue and will update you shortly."
