import { useState } from "react";
import Navbar from "@/components/Navbar";
import GroupCard from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { mockGroups, mockExpenses, calculateBalances } from "@/lib/mockData";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [groups, setGroups] = useState(mockGroups);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const { wallet, connectWallet } = useWallet();
  const { toast } = useToast();

  const handleWalletConnect = async () => {
    const result = await connectWallet();
    if (result.success) {
      toast({
        title: "Wallet Connected! 🎉",
        description: `Address: ${result.address.slice(0, 10)}...`,
      });
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup = {
      id: (groups.length + 1).toString(),
      name: newGroupName,
      members: [mockGroups[0].members[0]], // Add current user
      totalSpend: 0,
      currency: "USD",
      createdAt: new Date().toISOString(),
    };

    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setIsCreateModalOpen(false);

    toast({
      title: "Group Created! 🎉",
      description: `${newGroupName} is ready to track expenses`,
    });
  };

  // Calculate quick stats
  const calculateQuickStats = () => {
    let youOwe = 0;
    let youreOwed = 0;

    groups.forEach(group => {
      const balances = calculateBalances(group.id);
      const currentUserId = "1"; // Mock current user
      
      balances.forEach(balance => {
        if (balance.from === currentUserId) {
          youOwe += balance.amount;
        }
        if (balance.to === currentUserId) {
          youreOwed += balance.amount;
        }
      });
    });

    return { youOwe, youreOwed, netBalance: youreOwed - youOwe };
  };

  const stats = calculateQuickStats();

  return (
    <div className="min-h-screen">
      <Navbar
        walletAddress={wallet.address}
        isConnected={wallet.isConnected}
        onWalletClick={handleWalletConnect}
      />

      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section with Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Card className="relative p-8 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 animate-gradient-shift bg-300%" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      Welcome back!
                    </h1>
                    <p className="text-muted-foreground">Here's your expense overview</p>
                  </div>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    New Group
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">You Owe</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                      ${stats.youOwe.toFixed(2)}
                    </p>
                  </div>

                  <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">You're Owed</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                      ${stats.youreOwed.toFixed(2)}
                    </p>
                  </div>

                  <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <ArrowRight className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">Net Balance</span>
                    </div>
                    <p className={`text-3xl font-bold ${stats.netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${Math.abs(stats.netBalance).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Groups Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Your Groups</h2>
                <p className="text-muted-foreground">
                  {groups.length} {groups.length === 1 ? "group" : "groups"} active
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GroupCard group={group} />
                </motion.div>
              ))}
            </div>

            {groups.length === 0 && (
              <Card className="p-12 text-center bg-white/5 backdrop-blur-md border-white/10">
                <p className="text-xl text-muted-foreground mb-6">
                  No groups yet. Create your first group to start tracking expenses!
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Create First Group
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Create Group Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Group</DialogTitle>
            <DialogDescription>
              Start tracking shared expenses with your roommates, friends, or travel companions
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGroup} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                placeholder="e.g., 🏠 Apartment Squad"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Group
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
