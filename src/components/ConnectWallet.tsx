import React from 'react';
import { Wallet, Shield, Users, Award } from 'lucide-react';

interface ConnectWalletProps {
  onConnect: () => void;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SkillMint</h1>
          <p className="text-gray-600">
            The decentralized platform for skill-based micro-learning and certification
          </p>
        </div>

        <div className="card mb-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Secure & Decentralized</h3>
                <p className="text-sm text-gray-600">All skills and certifications are stored on the Stacks blockchain</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Peer Review System</h3>
                <p className="text-sm text-gray-600">Skills are validated by community peer reviews</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">NFT Certificates</h3>
                <p className="text-sm text-gray-600">Earn verifiable NFT certificates for your skills</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Wallet className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Monetize Skills</h3>
                <p className="text-sm text-gray-600">Create bounties and get paid for your expertise</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onConnect}
          className="w-full btn-primary text-lg py-3 flex items-center justify-center space-x-2"
        >
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          By connecting, you agree to use this platform for educational purposes only.
        </p>
      </div>
    </div>
  );
};

export default ConnectWallet;
