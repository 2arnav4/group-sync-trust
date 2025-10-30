import { useState, useCallback } from 'react';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: string;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    balance: "0.00",
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock wallet address
    const mockAddress = "0x" + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const mockBalance = (Math.random() * 10).toFixed(4);
    
    setWallet({
      address: mockAddress,
      isConnected: true,
      balance: mockBalance,
    });
    
    setIsConnecting(false);
    return { success: true, address: mockAddress };
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      balance: "0.00",
    });
  }, []);

  const executeSmartContract = useCallback(async (action: string, amount: number) => {
    if (!wallet.isConnected) {
      throw new Error("Wallet not connected");
    }

    // Simulate contract execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      txHash: "0x" + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      action,
      amount,
    };
  }, [wallet.isConnected]);

  return {
    wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    executeSmartContract,
  };
};
