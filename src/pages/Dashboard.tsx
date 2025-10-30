import { useState } from "react";
import Navbar from "@/components/Navbar";
import GroupCard from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { mockGroups } from "@/lib/mockData";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

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
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Your Groups</h1>
              <p className="text-muted-foreground mt-2">
                Manage expenses across {groups.length} {groups.length === 1 ? "group" : "groups"}
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              New Group
            </Button>
          </div>

          {/* Groups Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <div
                key={group.id}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GroupCard group={group} />
              </div>
            ))}
          </div>

          {groups.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
              <p className="text-xl text-muted-foreground mb-6">
                No groups yet. Create your first group to start tracking expenses!
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create First Group
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Start tracking shared expenses with your roommates, friends, or travel companions
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                placeholder="e.g., 🏠 Apartment Squad"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
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
