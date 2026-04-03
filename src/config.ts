
// Centralized configuration for the API URL
// In development, this defaults to the local backend on port 8000
// In production, it MUST be set via the VITE_API_URL environment variable
export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');
