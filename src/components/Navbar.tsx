import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface NavbarProps {
  walletAddress?: string | null;
  isConnected?: boolean;
  onWalletClick?: () => void;
}

const Navbar = ({ walletAddress, isConnected, onWalletClick }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-card/60 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <span className="text-slate-900 font-bold text-xl">F</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                FlowFunds
              </span>
              <p className="text-xs text-muted-foreground">Split smarter</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLanding && (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-foreground">Dashboard</Button>
                </Link>
                <Link to="/wallet">
                  <Button variant="ghost" className="text-foreground">Smart Wallet</Button>
                </Link>
              </>
            )}
            
            {onWalletClick && (
              <Button
                variant={isConnected ? "secondary" : "default"}
                onClick={onWalletClick}
                className="gap-2"
              >
                <Wallet className="w-4 h-4" />
                {isConnected && walletAddress ? (
                  <span className="font-mono text-sm">{formatAddress(walletAddress)}</span>
                ) : (
                  <span>Connect Wallet</span>
                )}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-2"
          >
            {!isLanding && (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/wallet" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Smart Wallet
                  </Button>
                </Link>
              </>
            )}
            {onWalletClick && (
              <Button
                variant={isConnected ? "secondary" : "default"}
                onClick={() => {
                  onWalletClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full gap-2"
              >
                <Wallet className="w-4 h-4" />
                {isConnected && walletAddress ? formatAddress(walletAddress) : "Connect Wallet"}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
