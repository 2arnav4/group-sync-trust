import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/hooks/useWallet";
import { Link } from "react-router-dom";
import { Sparkles, Shield, Zap, Users, Wallet, ArrowRight, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/flowfunds-hero.jpg";
import { motion } from "framer-motion";

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
      icon: <Zap className="w-7 h-7" />,
      title: "Track Shared Expenses",
      description: "Real-time expense tracking with instant notifications and smart categorization",
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Simplify Settlements",
      description: "Automatic debt simplification algorithm minimizes transactions needed",
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Build Trust with Smart Contracts",
      description: "Optional blockchain escrow for transparency without the complexity",
      gradient: "from-violet-400 to-fuchsia-500",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar 
        walletAddress={wallet.address}
        isConnected={wallet.isConnected}
        onWalletClick={handleWalletConnect}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 animate-gradient-shift bg-300%" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
                <Sparkles className="w-4 h-4 text-primary animate-glow" />
                <span className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Fair. Fast. Future-Ready.
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                  FlowFunds
                </span>
              </h1>
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                The Smarter Way to Split & Settle
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Next-gen expense management with optional{" "}
                <span className="text-primary font-semibold">Web3 trust layer</span>. 
                Split costs fairly, settle instantly, and build transparency with your group.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button variant="glow" size="xl" className="w-full gap-2">
                    Start Splitting
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

              <div className="flex items-center gap-8 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-glow" />
                  <span>No fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-glow" />
                  <span>No signup required</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Hero Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl blur-3xl opacity-20 animate-glow" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
                <img
                  src={heroImage}
                  alt="Modern expense management interface"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Built for modern teams
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage shared expenses with trust and transparency
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative group p-8 bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
                  {/* Gradient Glow on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative z-10 space-y-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="relative p-16 text-center space-y-8 bg-white/5 backdrop-blur-md border-white/10 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />
            
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Ready to experience
                </span>
                <br />
                <span className="text-foreground">smarter expense sharing?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join modern teams already using FlowFunds
              </p>
              <div className="pt-4">
                <Link to="/dashboard">
                  <Button variant="glow" size="xl" className="gap-2">
                    Get Started Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              © 2024 FlowFunds. Because trust looks better in gradients.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
