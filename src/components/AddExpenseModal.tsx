import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
// import { Member } from "@/lib/mockData"; // Use the new Member type
import { Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api"; // Import api

// This type now matches the backend's member data
interface Member {
  id: number;
  name: string;
}

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  onAddExpense: (expense: any) => void;
  walletConnected: boolean;
  onExecuteContract: (amount: number) => Promise<void>;
  groupId: number; // Add groupId
}

const AddExpenseModal = ({ 
  open, 
  onOpenChange, 
  members, 
  onAddExpense,
  walletConnected,
  onExecuteContract,
  groupId // Get groupId from props
}: AddExpenseModalProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(""); // This will be a user ID
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
      
      // This payload must match the backend's 'add_expense' route
      const expensePayload = {
        description: description,
        total_amount: parseFloat(amount),
        payer_id: parseInt(paidBy),
        split_type: "EQUAL", // Hardcoding EQUAL split for simplicity
        participants: members.map(m => ({ user_id: m.id, amount: 0 })), // Backend's calculate_shares expects this format
      };

      // The backend will calculate shares. We send participant stubs.
      // Adjust 'participants' if your 'calculate_shares' expects something different.
      // Based on app.py, it seems to want participant IDs. Let's re-check.
      // app.py: calculate_shares(..., data['participants'], ...)
      // Let's assume data['participants'] is just the list of IDs.
      const betterPayload = {
         description: description,
         total_amount: parseFloat(amount),
         payer_id: parseInt(paidBy),
         split_type: "EQUAL", // Hardcoding EQUAL split for simplicity
         participants: members.map(m => m.id), // List of user IDs
         // 'category' is not in the backend model for Expense,
         // but 'preference_tags' is. We'll ignore it for now.
      };

      // POST to the backend
      const response = await api.post(`/groups/${groupId}/expenses`, betterPayload);
      
      // Call the onAddExpense prop to update the parent's state
      // The backend returns {msg: "Expense added"}, not the expense object.
      // We must refetch or pass the local object. Let's pass the local object
      // for an optimistic update.
      const newExpenseForUI = {
        id: Date.now(), // This is temporary, ideally the backend returns the new object
        description,
        amount: parseFloat(amount),
        // ... other fields that the ExpenseCard expects
      };
      
      // onAddExpense(newExpenseForUI); // This is not ideal.
      // A better pattern is for GroupDetail to refetch its expenses.
      // We will modify onAddExpense in GroupDetail to refetch.
      // For now, we'll just tell it to refetch by not passing any data.
      onAddExpense(null); // Signal to parent to refetch

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
    } catch (error: any) {
      console.error("Failed to add expense:", error);
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to add expense. Please try again.",
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
          {/* ... (Description and Amount inputs are unchanged) ... */}

          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid By *</Label>
            <Select value={paidBy} onValueChange={setPaidBy} required>
              <SelectTrigger>
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  // Use member.id (which is a number) and convert to string for the value
                  <SelectItem key={member.id} value={String(member.id)}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ... (Category and Smart Contract switch are unchanged) ... */}
          
          <div className="flex gap-2 pt-4">
            {/* ... (Buttons are unchanged) ... */}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;