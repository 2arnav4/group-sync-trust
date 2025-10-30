import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Balance {
  from_id: number;
  from_name: string;
  to_id: number;
  to_name: string;
  amount: number;
}

interface BalanceCardProps {
  balance: Balance;
  onSmartSettle?: (balance: Balance) => void;
  walletConnected: boolean;
}

const BalanceCard = ({ balance, onSmartSettle, walletConnected }: BalanceCardProps) => {
  const { toast } = useToast();

  const handleUPISettle = () => {
    // Mock UPI link (in real app you'd use user's UPI ID)
    const upiLink = `upi://pay?pa=${balance.to_name}@upi&pn=${balance.to_name}&am=${balance.amount}&cu=INR`;
    toast({
      title: "UPI Link Generated",
      description: "Opening payment app...",
    });
    // window.location.href = upiLink; // Uncomment when testing on mobile
  };

  const handleSmartSettle = () => {
    if (onSmartSettle) onSmartSettle(balance);
  };

  return (
    <Card className="p-4 border-l-4 border-l-accent">
      <div className="space-y-4">
        {/* Balance Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center text-sm font-semibold text-white">
              {balance.from_name.charAt(0)}
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-sm font-semibold text-white">
              {balance.to_name.charAt(0)}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              ₹{balance.amount.toFixed(2)}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{balance.from_name}</span> owes{" "}
          <span className="font-semibold text-foreground">{balance.to_name}</span>
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleUPISettle}
          >
            <Smartphone className="w-4 h-4" />
            Settle via UPI
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleSmartSettle}
            disabled={!walletConnected}
            title={!walletConnected ? "Connect wallet first" : "Settle with smart contract"}
          >
            <Lock className="w-4 h-4" />
            Smart Settle
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BalanceCard;
