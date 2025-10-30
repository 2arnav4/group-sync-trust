import { useState } from "react";
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
import { mockGroups, mockExpenses, calculateBalances, Expense, Balance } from "@/lib/mockData";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

const GroupDetail = () => {
  const { groupId } = useParams();
  const group = mockGroups.find((g) => g.id === groupId);
  const [expenses, setExpenses] = useState<Expense[]>(
    mockExpenses.filter((e) => e.groupId === groupId)
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { wallet, connectWallet, executeSmartContract } = useWallet();
  const { toast } = useToast();
  const [isSettling, setIsSettling] = useState(false);

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Group Not Found</h1>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const balances = calculateBalances(groupId!);
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

  const handleAddExpense = (newExpense: any) => {
    setExpenses([{ ...newExpense, groupId: groupId! }, ...expenses]);
  };

  const handleExecuteContract = async (amount: number) => {
    await executeSmartContract("lock_funds", amount);
  };

  const handleSmartSettle = async (balance: Balance) => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsSettling(true);
    try {
      await executeSmartContract("settle_debt", balance.amount);
      toast({
        title: "Settlement Complete! ✅",
        description: `Funds released from escrow: $${balance.amount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Settlement Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSettling(false);
    }
  };

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
                <h1 className="text-4xl font-bold text-foreground">{group.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex -space-x-2">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-white border-2 border-background"
                        title={member.name}
                      >
                        {member.avatar}
                      </div>
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    {group.members.length} members
                  </span>
                  {wallet.isConnected && (
                    <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                      <Check className="w-3 h-3" />
                      Wallet Connected
                    </Badge>
                  )}
                </div>
              </div>

              <Button onClick={() => setIsAddModalOpen(true)} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Add Expense
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${totalExpenses.toFixed(2)}
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
                    <p className="text-2xl font-bold text-foreground">{expenses.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Smart Contracts</p>
                    <p className="text-2xl font-bold text-foreground">
                      {expenses.filter((e) => e.isSmartContract).length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="expenses" className="animate-fade-in">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="balances">Balances</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="space-y-4 mt-6">
              {expenses.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No expenses yet</p>
                  <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
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
                  <p className="text-muted-foreground">No outstanding balances</p>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {balances.length} {balances.length === 1 ? "balance" : "balances"} to settle
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

      <AddExpenseModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        members={group.members}
        onAddExpense={handleAddExpense}
        walletConnected={wallet.isConnected}
        onExecuteContract={handleExecuteContract}
      />
    </div>
  );
};

export default GroupDetail;
