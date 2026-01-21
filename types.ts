
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  userId: string;
  aiSuggestedSolution?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    ticketId?: string;
  }
}
