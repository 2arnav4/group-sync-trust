import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Balance, mockMembers } from "@/lib/mockData";
import { ArrowRight, Smartphone, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BalanceCardProps {
  balance: Balance;
  onSmartSettle?: (balance: Balance) => void;
  walletConnected: boolean;
}

const BalanceCard = ({ balance, onSmartSettle, walletConnected }: BalanceCardProps) => {
  const { toast } = useToast();
  const fromMember = mockMembers.find(m => m.id === balance.from);
  const toMember = mockMembers.find(m => m.id === balance.to);

  const handleUPISettle = () => {
    // In real app, this would generate a UPI link
    const upiLink = `upi://pay?pa=${toMember?.email}&pn=${toMember?.name}&am=${balance.amount}&cu=USD`;
    toast({
      title: "UPI Link Generated",
      description: "Opening payment app...",
    });
    // window.location.href = upiLink; // Uncomment in production
  };

  const handleSmartSettle = () => {
    if (onSmartSettle) {
      onSmartSettle(balance);
    }
  };

  return (
    <Card className="p-4 border-l-4 border-l-accent">
      <div className="space-y-4">
        {/* Balance Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center text-sm font-semibold text-white">
              {fromMember?.avatar}
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-sm font-semibold text-white">
              {toMember?.avatar}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              ${balance.amount.toFixed(2)}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{fromMember?.name}</span> owes{" "}
          <span className="font-semibold text-foreground">{toMember?.name}</span>
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
