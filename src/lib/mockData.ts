// src/lib/mockData.ts

// ---------- Interfaces ----------
// import { Member, Expense, Group, Balance } from "../types";

export interface Member {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export interface Expense {
  id: number;
  groupId: number;
  description: string;
  amount: number;
  paidBy: number;
  participants: number[];
  date: string;
  category: string;
  isSmartContract: boolean;
}

export interface Group {
  id: number;
  name: string;
  members: Member[];
  totalSpend: number;
  currency: string;
  createdAt: string;
}

export interface Balance {
  from: number;
  to: number;
  amount: number;
}

// ---------- Mock Data ----------

export const mockMembers: Member[] = [
  {
    id: 1,
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "AC",
  },
  {
    id: 2,
    name: "Sarah Kumar",
    email: "sarah@example.com",
    avatar: "SK",
  },
  {
    id: 3,
    name: "James Wilson",
    email: "james@example.com",
    avatar: "JW",
  },
  {
    id: 4,
    name: "Maya Patel",
    email: "maya@example.com",
    avatar: "MP",
  },
];

export const mockGroups: Group[] = [
  {
    id: 1,
    name: "🏠 Apartment Squad",
    members: [mockMembers[0], mockMembers[1], mockMembers[2]],
    totalSpend: 3450.75,
    currency: "USD",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "🌴 Bali Trip 2024",
    members: [mockMembers[0], mockMembers[1], mockMembers[2], mockMembers[3]],
    totalSpend: 8920.5,
    currency: "USD",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    name: "🍕 Friday Night Crew",
    members: [mockMembers[0], mockMembers[3]],
    totalSpend: 245.3,
    currency: "USD",
    createdAt: "2024-03-01",
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 1,
    groupId: 1,
    description: "Monthly Rent",
    amount: 2400.0,
    paidBy: 1,
    participants: [1, 2, 3],
    date: "2024-03-01",
    category: "Housing",
    isSmartContract: true,
  },
  {
    id: 2,
    groupId: 1,
    description: "Electricity Bill",
    amount: 180.5,
    paidBy: 2,
    participants: [1, 2, 3],
    date: "2024-03-05",
    category: "Utilities",
    isSmartContract: false,
  },
  {
    id: 3,
    groupId: 1,
    description: "Groceries - Costco",
    amount: 320.25,
    paidBy: 3,
    participants: [1, 2, 3],
    date: "2024-03-10",
    category: "Food",
    isSmartContract: false,
  },
  {
    id: 4,
    groupId: 1,
    description: "Internet Bill",
    amount: 89.99,
    paidBy: 1,
    participants: [1, 2, 3],
    date: "2024-03-12",
    category: "Utilities",
    isSmartContract: false,
  },
  {
    id: 5,
    groupId: 2,
    description: "Flight Tickets",
    amount: 4500.0,
    paidBy: 1,
    participants: [1, 2, 3, 4],
    date: "2024-02-20",
    category: "Travel",
    isSmartContract: true,
  },
  {
    id: 6,
    groupId: 2,
    description: "Hotel - 5 Nights",
    amount: 2800.0,
    paidBy: 2,
    participants: [1, 2, 3, 4],
    date: "2024-03-01",
    category: "Accommodation",
    isSmartContract: true,
  },
  {
    id: 7,
    groupId: 3,
    description: "Pizza & Wings",
    amount: 65.4,
    paidBy: 1,
    participants: [1, 4],
    date: "2024-03-15",
    category: "Food",
    isSmartContract: false,
  },
];

// ---------- Balance Calculation ----------

export const calculateBalances = (groupId: number): Balance[] => {
  const expenses = mockExpenses.filter((e) => e.groupId === groupId);
  const group = mockGroups.find((g) => g.id === groupId);

  if (!group) return [];

  const balanceMap: { [key: number]: number } = {};

  // Initialize all members with 0 balance
  group.members.forEach((member) => {
    balanceMap[member.id] = 0;
  });

  // Calculate balances
  expenses.forEach((expense) => {
    const splitAmount = expense.amount / expense.participants.length;

    // Person who paid gets credit
    balanceMap[expense.paidBy] += expense.amount;

    // Each participant owes their share
    expense.participants.forEach((participantId) => {
      balanceMap[participantId] -= splitAmount;
    });
  });

  // Convert to balance objects
  const balances: Balance[] = [];
  const memberIds = Object.keys(balanceMap).map(Number);

  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const balance1 = balanceMap[memberIds[i]];
      const balance2 = balanceMap[memberIds[j]];

      if (balance1 > 0 && balance2 < 0) {
        const amount = Math.min(balance1, Math.abs(balance2));
        if (amount > 0.01) {
          balances.push({
            from: memberIds[j],
            to: memberIds[i],
            amount: Math.round(amount * 100) / 100,
          });
        }
      } else if (balance2 > 0 && balance1 < 0) {
        const amount = Math.min(balance2, Math.abs(balance1));
        if (amount > 0.01) {
          balances.push({
            from: memberIds[i],
            to: memberIds[j],
            amount: Math.round(amount * 100) / 100,
          });
        }
      }
    }
  }

  return balances;
};
