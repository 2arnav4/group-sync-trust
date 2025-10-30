import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Member } from "@/lib/mockData";
import { Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  onAddExpense: (expense: any) => void;
  walletConnected: boolean;
  onExecuteContract: (amount: number) => Promise<void>;
}

const AddExpenseModal = ({ 
  open, 
  onOpenChange, 
  members, 
  onAddExpense,
  walletConnected,
  onExecuteContract 
}: AddExpenseModalProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [category, setCategory] = useState("Food");
  const [useSmartContract, setUseSmartContract] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = ["Housing", "Utilities", "Food", "Travel", "Accommodation", "Entertainment", "Other"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !paidBy) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (useSmartContract && walletConnected) {
        await onExecuteContract(parseFloat(amount));
        toast({
          title: "Smart Contract Executed! 🔒",
          description: `Funds locked in escrow: $${amount}`,
        });
      }

      const newExpense = {
        id: Date.now().toString(),
        description,
        amount: parseFloat(amount),
        paidBy,
        participants: members.map(m => m.id),
        date: new Date().toISOString().split('T')[0],
        category,
        isSmartContract: useSmartContract && walletConnected,
      };

      onAddExpense(newExpense);

      toast({
        title: "Expense Added! 🎉",
        description: `${description} - $${amount}`,
      });

      // Reset form
      setDescription("");
      setAmount("");
      setPaidBy("");
      setCategory("Food");
      setUseSmartContract(false);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Split costs fairly with your group
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="e.g., Dinner at restaurant"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid By *</Label>
            <Select value={paidBy} onValueChange={setPaidBy} required>
              <SelectTrigger>
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <div>
                <Label htmlFor="smart-contract" className="cursor-pointer">
                  Lock in Smart Contract
                </Label>
                <p className="text-xs text-muted-foreground">
                  {walletConnected ? "Secure funds with blockchain" : "Connect wallet first"}
                </p>
              </div>
            </div>
            <Switch
              id="smart-contract"
              checked={useSmartContract}
              onCheckedChange={setUseSmartContract}
              disabled={!walletConnected}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
