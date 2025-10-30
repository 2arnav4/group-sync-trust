import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wallet, Lock, Unlock, TrendingUp, ArrowUpRight, ArrowDownRight, Copy, ExternalLink } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const SmartWallet = () => {
  const { wallet, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const { toast } = useToast();
  const [autoLock, setAutoLock] = useState(false);

  const handleWalletConnect = async () => {
    const result = await connectWallet();
    if (result.success) {
      toast({
        title: "Wallet Connected! 🎉",
        description: `Address: ${result.address.slice(0, 10)}...`,
      });
    }
  };

  const handleCopyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const mockTransactions = [
    {
      id: "1",
      type: "lock",
      amount: 800.00,
      description: "Monthly Rent - Escrow Locked",
      date: "2024-03-01",
      status: "locked",
    },
    {
      id: "2",
      type: "release",
      amount: 800.00,
      description: "Monthly Rent - Escrow Released",
      date: "2024-03-05",
      status: "completed",
    },
    {
      id: "3",
      type: "lock",
      amount: 1500.00,
      description: "Flight Tickets - Escrow Locked",
      date: "2024-02-20",
      status: "locked",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar
        walletAddress={wallet.address}
        isConnected={wallet.isConnected}
        onWalletClick={handleWalletConnect}
      />

      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Smart Wallet
            </h1>
            <p className="text-muted-foreground">
              Manage your Web3 wallet and smart contract escrow transactions
            </p>
          </motion.div>

          {!wallet.isConnected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-12 text-center bg-white/5 backdrop-blur-md border-white/10">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                    <Wallet className="w-10 h-10 text-slate-900" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Connect Your Wallet</h2>
                  <p className="text-muted-foreground">
                    Connect your Web3 wallet to enable smart contract features and track escrow transactions
                  </p>
                  <Button
                    variant="glow"
                    size="lg"
                    onClick={handleWalletConnect}
                    disabled={isConnecting}
                    className="gap-2"
                  >
                    <Wallet className="w-5 h-5" />
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Wallet Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="relative p-8 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 animate-gradient-shift bg-300%" />
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-mono text-foreground">{wallet.address}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopyAddress}
                            className="h-8 w-8"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={disconnectWallet}
                      >
                        Disconnect
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                          </div>
                          <span className="text-sm text-muted-foreground">Wallet Balance</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                          {wallet.balance} ETH
                        </p>
                      </div>

                      <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <Lock className="w-5 h-5 text-cyan-400" />
                          </div>
                          <span className="text-sm text-muted-foreground">In Escrow</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                          $2,300.00
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Auto-Lock Setting */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-white/5 backdrop-blur-md border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        <Label htmlFor="auto-lock" className="text-lg font-semibold cursor-pointer">
                          Auto-Lock in Smart Contract
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automatically lock all new expenses in smart contract escrow for transparency
                      </p>
                    </div>
                    <Switch
                      id="auto-lock"
                      checked={autoLock}
                      onCheckedChange={setAutoLock}
                    />
                  </div>
                </Card>
              </motion.div>

              {/* Escrow Transactions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-foreground">Escrow Transactions</h2>
                
                <div className="space-y-3">
                  {mockTransactions.map((tx) => (
                    <Card key={tx.id} className="p-5 bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${
                            tx.type === "lock" 
                              ? "bg-cyan-500/20" 
                              : "bg-emerald-500/20"
                          }`}>
                            {tx.type === "lock" ? (
                              <Lock className="w-5 h-5 text-cyan-400" />
                            ) : (
                              <Unlock className="w-5 h-5 text-emerald-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">
                              {tx.description}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-xl font-bold text-foreground">
                            ${tx.amount.toFixed(2)}
                          </p>
                          <Badge 
                            variant={tx.status === "locked" ? "secondary" : "default"}
                            className={tx.status === "locked" ? "bg-cyan-500/20 text-cyan-400" : "bg-emerald-500/20 text-emerald-400"}
                          >
                            {tx.status === "locked" ? "Locked" : "Released"}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SmartWallet;
