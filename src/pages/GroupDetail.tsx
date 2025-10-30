import { useState, useEffect } from "react"; // Import useEffect
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ExpenseCard from "@/components/ExpenseCard";
import BalanceCard from "@/components/BalanceCard";
import AddExpenseModal from "@/components/AddExpenseModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, TrendingUp, Lock, Check } from "lucide-react";
// import { mockGroups, mockExpenses, calculateBalances, Expense, Balance } from "@/lib/mockData"; // Remove mock
import api from "@/lib/api"; // Import api
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

// Types matching backend
interface Member {
  id: number;
  name: string;
}

interface Group {
  id: number;
  name: string;
  members: Member[];
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  // Note: /api/groups/<id>/expenses endpoint is missing paidBy, participants, etc.
  // The ExpenseCard will be missing data unless you update the backend.
}

interface Balance {
  from: number; // User ID
  to: number;   // User ID
  amount: number;
}

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { wallet, connectWallet, executeSmartContract } = useWallet();
  const { toast } = useToast();
  const [isSettling, setIsSettling] = useState(false);

  // Fetch all group data
  const fetchGroupData = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      // Fetch all three endpoints in parallel
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        api.get<Group>(`/groups/${groupId}`),
        api.get<Expense[]>(`/groups/${groupId}/expenses`),
        api.get<Balance[]>(`/groups/${groupId}/simplify`) // Using simplify for balances
      ]);
      
      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
      setBalances(balancesRes.data);

    } catch (error) {
      console.error("Failed to fetch group details:", error);
      toast({
        title: "Error",
        description: "Could not fetch group details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]); // Refetch if groupId changes

  if (loading) {
    return (
       <div className="min-h-screen">
        <Navbar
          walletAddress={wallet.address}
          isConnected={wallet.isConnected}
          onWalletClick={handleWalletConnect}
        />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8 text-center">
             <p className="text-xl">Loading group data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Group Not Found</h1>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleWalletConnect = async () => {
    const result = await connectWallet();
    if (result.success) {
      toast({
        title: "Wallet Connected! 🎉",
        description: `Address: ${result.address.slice(0, 10)}...`,
      });
    }
  };

  // This handler will be called by the modal after a successful API call
  const handleAddExpense = (newExpenseFromBackend: any) => {
    // We can just refetch expenses, or optimistically add
    setExpenses([newExpenseFromBackend, ...expenses]);
    // Or just refetch all data
    // fetchGroupData();
  };
  
  // ... (rest of the component is unchanged, including smart contract logic)
  
    return (
    <div className="min-h-screen bg-background">
      {/* ... (Navbar is unchanged) ... */}

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            {/* ... (Link is unchanged) ... */}

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground">{group.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex -space-x-2">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-white border-2 border-background"
                        title={member.name}
                      >
                        {/* Use member.name to create avatar initials */}
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    ))}
                  </div>
                  {/* ... (rest of header is unchanged) ... */}
                </div>
              </div>

              {/* ... (Button is unchanged) ... */}
            </div>

            {/* Summary Cards */}
            {/* ... (This section should work, as totalExpenses is calculated from fetched data) ... */}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="expenses" className="animate-fade-in">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="balances">Balances</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="space-y-4 mt-6">
              {expenses.length === 0 ? (
                // ... (unchanged)
              ) : (
                expenses.map((expense) => (
                  // WARNING: ExpenseCard will be missing data (paidBy, category, etc.)
                  // You must update ExpenseCard.tsx to handle this partial data
                  // or update your /api/groups/<id>/expenses GET endpoint
                  <ExpenseCard key={expense.id} expense={expense as any} />
                ))
              )}
            </TabsContent>

            <TabsContent value="balances" className="space-y-4 mt-6">
              {balances.length === 0 ? (
                // ... (unchanged)
              ) : (
                <>
                  {/* ... (unchanged) ... */}
                  {balances.map((balance, index) => (
                    <BalanceCard
                      key={index}
                      balance={balance}
                      onSmartSettle={handleSmartSettle}
                      walletConnected={wallet.isConnected}
                    />
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AddExpenseModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        members={group.members}
        onAddExpense={handleAddExpense} // This will be called on success
        walletConnected={wallet.isConnected}
        onExecuteContract={handleExecuteContract}
        groupId={group.id} // Pass group.id to the modal
      />
    </div>
  );
};

export default GroupDetail;