// src/lib/types.ts

export interface Member {
  id: number;
  name: string;
}

export interface ExpenseParticipant {
  user_id: number;
  name: string;
  amount: number;
}

// This is the unified Expense type to use everywhere
export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  paidBy: number; // Changed to number to hold the user ID
  payerName: string; // Add a field for the user's name
  participants: ExpenseParticipant[];
  category: string;
  isSmartContract?: boolean;
}

export interface Balance {
  from_id: number;
  from_name: string;
  to_id: number;
  to_name: string;
  amount: number;
}

export interface Group {
  id: number;
  name: string;
  members: Member[];
}
