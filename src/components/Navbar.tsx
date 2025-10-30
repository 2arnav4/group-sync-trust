import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Menu, X } from "lucide-react";
import { useState } from "react";

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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-card/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">FS</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:block">
              FairShare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLanding && (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
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
                  <span className="hidden lg:inline">{formatAddress(walletAddress)}</span>
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
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            {!isLanding && (
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
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
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
