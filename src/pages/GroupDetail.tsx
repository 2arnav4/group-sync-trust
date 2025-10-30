import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ExpenseCard from "@/components/ExpenseCard";
import BalanceCard from "@/components/BalanceCard";
import AddExpenseModal from "@/components/AddExpenseModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, TrendingUp, Check } from "lucide-react";
import api from "@/lib/api";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

// --- Import Unified Types ---
// Make sure you have a central types file (e.g., src/lib/types.ts)
// with the corrected interfaces.
import { Group, Expense, Balance } from "@/lib/types";

// --- Component ---
const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const { wallet, connectWallet, executeSmartContract } = useWallet();
  const { toast } = useToast();

  // Fetch all group data from the backend
  const fetchGroupData = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      // Use Promise.all to fetch data in parallel for better performance
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        api.get<Group>(`/groups/${groupId}`),
        api.get<Expense[]>(`/groups/${groupId}/expenses`),
        api.get<Balance[]>(`/groups/${groupId}/simplify`),
      ]);

      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
      setBalances(balancesRes.data);
    } catch (error) {
      console.error("Failed to fetch group details:", error);
      toast({
        title: "Error",
        description: "Could not fetch group details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  // Re-fetch data after adding a new expense
  const handleAddExpense = () => {
    fetchGroupData();
  };

  // Handle wallet connection
  const handleWalletConnect = async () => {
    const result = await connectWallet();
    if (result.success) {
      toast({
        title: "Wallet Connected! 🎉",
        description: `Address: ${result.address.slice(0, 10)}...`,
      });
    }
  };

  // Handle smart contract settlement
  const handleSmartSettle = async (balance: Balance) => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first to use this feature.",
        variant: "destructive",
      });
      return;
    }

    setIsSettling(true);
    try {
      await executeSmartContract("settle_debt", balance.amount);
      toast({
        title: "Settlement Complete! ✅",
        description: `Funds have been released from escrow: $${balance.amount.toFixed(
          2
        )}`,
      });
      // Re-fetch data to show the updated balances
      fetchGroupData();
    } catch (error) {
      console.error("Smart settlement failed:", error);
      toast({
        title: "Settlement Failed",
        description: "The smart contract transaction failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSettling(false);
    }
  };

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
          <p className="text-muted-foreground">The group you are looking for does not exist.</p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        walletAddress={wallet.address}
        isConnected={wallet.isConnected}
        onWalletClick={handleWalletConnect}
      />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <Link to="/dashboard">
              <Button variant="ghost" className="gap-2 -ml-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Groups
              </Button>
            </Link>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground">
                  {group.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex -space-x-2">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-white border-2 border-background"
                        title={member.name}
                      >
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    {group.members.length} members
                  </span>
                  {wallet.isConnected && (
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-primary/10 text-primary"
                    >
                      <Check className="w-3 h-3" />
                      Wallet Connected
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="lg"
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Expense
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{totalExpenses.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expenses</p>
                    <p className="text-2xl font-bold text-foreground">
                      {expenses.length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Tabs for Expenses and Balances */}
          <Tabs defaultValue="expenses" className="animate-fade-in">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="balances">Balances</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="space-y-4 mt-6">
              {expenses.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No expenses yet</p>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add First Expense
                  </Button>
                </Card>
              ) : (
                expenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))
              )}
            </TabsContent>

            <TabsContent value="balances" className="space-y-4 mt-6">
              {balances.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-xl font-semibold text-foreground mb-2">
                    All Settled! 🎉
                  </p>
                  <p className="text-muted-foreground">
                    There are no outstanding balances in this group.
                  </p>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {balances.length}{" "}
                      {balances.length === 1 ? "balance" : "balances"} to settle
                    </p>
                  </div>
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

      {/* Add Expense Modal */}
      {group && (
        <AddExpenseModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          members={group.members}
          onAddExpense={handleAddExpense}
          walletConnected={wallet.isConnected}
          onExecuteContract={async (amount) => {
            await executeSmartContract("add_expense", amount);
          }}
          groupId={group.id}
        />
      )}
    </div>
  );
};

export default GroupDetail;
