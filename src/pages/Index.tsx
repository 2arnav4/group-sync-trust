import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/hooks/useWallet";
import { Link } from "react-router-dom";
import { CheckCircle, Shield, Zap, Users, Wallet, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const { wallet, isConnecting, connectWallet } = useWallet();
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

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Split",
      description: "Add expenses and split them fairly in seconds",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Smart Contract Escrow",
      description: "Optional blockchain-based trust layer for settlements",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Group Management",
      description: "Track multiple groups - roommates, trips, friends",
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Easy Settlement",
      description: "Settle via UPI or smart contract with one click",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        walletAddress={wallet.address}
        isConnected={wallet.isConnected}
        onWalletClick={handleWalletConnect}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  ✨ Fair, Instant & Trustworthy
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                FairShare Ledger
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Track expenses. Split costs. Settle instantly. Now with{" "}
                <span className="text-primary font-semibold">smart-contract escrow</span>{" "}
                for total transparency.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="glass"
                  size="xl"
                  onClick={handleWalletConnect}
                  disabled={isConnecting}
                  className="w-full sm:w-auto gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Free forever</span>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Friends managing expenses together"
                className="relative rounded-3xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-4 animate-slide-up">
            <h2 className="text-4xl font-bold text-foreground">
              Everything you need to split expenses
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple, transparent, and optionally backed by blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center space-y-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 animate-scale-in">
            <h2 className="text-4xl font-bold text-foreground">
              Ready to simplify expense sharing?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of groups already using FairShare Ledger
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/dashboard">
                <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                  Start Tracking Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 FairShare Ledger. Built with transparency in mind.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
