import React, { useState, useEffect } from 'react';
import { isWalletConnected, getUserAddress, connectWallet, disconnectWallet } from './utils/wallet';
import { getContractStatus } from './utils/stacks';
import Dashboard from './components/Dashboard';
import ConnectWallet from './components/ConnectWallet';
import ContractStatus from './components/ContractStatus';
import { Wallet, LogOut } from 'lucide-react';
import type { ContractStatus as ContractStatusType } from './types';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [contractStatus, setContractStatus] = useState<ContractStatusType | null>(null);

  useEffect(() => {
    const connected = isWalletConnected();
    setIsConnected(connected);

    if (connected) {
      const address = getUserAddress();
      setUserAddress(address);
    }

    // Load contract status
    getContractStatus().then(setContractStatus).catch(console.error);
  }, []);

  const handleConnect = () => {
    connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  if (!isConnected) {
    return <ConnectWallet onConnect={handleConnect} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SM</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">SkillMint</h1>
              </div>
              <ContractStatus status={contractStatus} />
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Connected: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
              </div>
              <button
                onClick={handleDisconnect}
                className="flex items-center space-x-2 btn-secondary"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
