import { useState, useEffect } from "react"; // Import useEffect
import Navbar from "@/components/Navbar";
import GroupCard from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
// import { mockGroups, mockExpenses, calculateBalances } from "@/lib/mockData"; // Remove mock data
import api from "@/lib/api"; // Import the new api client
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Define types that match your backend's API response
export interface Group {
  id: number;
  name: string;
  // Note: The /api/groups endpoint doesn't return members, totalSpend, etc.
  // You will need to adjust GroupCard.tsx to handle this partial data
  // or update your /api/groups backend endpoint to return more data.
}

// Stats will be broken until you implement a real balance aggregation
interface QuickStats {
  youOwe: number;
  youreOwed: number;
  netBalance: number;
}

const Dashboard = () => {
  // const [groups, setGroups] = useState(mockGroups); // Remove mock state
  const [groups, setGroups] = useState<Group[]>([]); // Add new state
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const { wallet, connectWallet } = useWallet();
  const { toast } = useToast();
  
  // State for stats, initialized to 0
  const [stats, setStats] = useState<QuickStats>({ youOwe: 0, youreOwed: 0, netBalance: 0 });

  // Fetch groups from the backend
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups');
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast({
        title: "Error",
        description: "Could not fetch groups. Are you logged in?",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups on component load
  useEffect(() => {
    fetchGroups();
  }, []);

  // TODO: Fix stats calculation
  // This function is now broken because it relied on mock data.
  // To fix this, you need to either:
  // 1. Fetch balances for EVERY group (/api/groups/<id>/balances) and aggregate them.
  // 2. (Better) Create a new backend endpoint (e.g., /api/user/stats) that calculates
  //    this for the current user and returns it.
  // For now, we'll leave the stats at 0.
  useEffect(() => {
    const calculateQuickStats = async () => {
      // Placeholder: You must implement this logic.
      // const currentUserId = "1"; // You need to get this from your auth state (e.g., JWT)
      // let totalOwed = 0;
      // let totalOwes = 0;
      // 
      // for (const group of groups) {
      //   const balanceResponse = await api.get(`/groups/${group.id}/balances`);
      //   // ... logic to parse balances and aggregate
      // }
      //
      // setStats({ youOwe: totalOwes, youreOwed: totalOwed, netBalance: totalOwed - totalOwes });
      
      // Setting to 0 as a placeholder
      setStats({ youOwe: 0, youreOwed: 0, netBalance: 0 });
    };

    if (groups.length > 0) {
      calculateQuickStats();
    }
  }, [groups]); // Recalculate when groups change


  const handleWalletConnect = async () => {
    const result = await connectWallet();
    if (result.success) {
      toast({
        title: "Wallet Connected! 🎉",
        description: `Address: ${result.address.slice(0, 10)}...`,
      });
    }
  };

  // Update create group handler
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const response = await api.post('/groups', { name: newGroupName });
      
      // Add the new group to the state immediately or refetch
      // setGroups([...groups, response.data]); // Option 1: Add from response
      fetchGroups(); // Option 2: Refetch all groups

      setNewGroupName("");
      setIsCreateModalOpen(false);

      toast({
        title: "Group Created! 🎉",
        description: `${newGroupName} is ready to track expenses`,
      });

    } catch (error) {
      console.error("Failed to create group:", error);
      toast({
        title: "Error",
        description: "Could not create group.",
        variant: "destructive",
      });
    }
  };

  // ... (rest of the component is unchanged)

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
            {/* ... (Hero content is unchanged, it will now use the 'stats' state) ... */}
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
            {/* ... (Header is unchanged) ... */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Your Groups</h2>
                <p className="text-muted-foreground">
                  {groups.length} {groups.length === 1 ? "group" : "groups"} active
                </p>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <Card className="p-12 text-center bg-white/5 backdrop-blur-md border-white/10">
                <p className="text-xl text-muted-foreground">Loading groups...</p>
              </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!loading && groups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* WARNING: GroupCard will need to be updated.
                      The 'group' object here ONLY has 'id' and 'name'.
                      You must update GroupCard to handle this. */}
                  <GroupCard group={group as any} /> 
                </motion.div>
              ))}
            </div>

            {!loading && groups.length === 0 && (
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

      {/* Create Group Modal (Form logic is already updated) */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        {/* ... (Modal content is unchanged) ... */}
      </Dialog>
    </div>
  );
};

export default Dashboard;