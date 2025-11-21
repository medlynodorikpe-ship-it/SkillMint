import React, { useState, useEffect } from 'react';
import { Briefcase, DollarSign, Users, Calendar, MapPin } from 'lucide-react';
import { getBounty, claimBounty, formatSTX } from '../utils/stacks';
import type { SkillBounty } from '../types';

const BountyBoard: React.FC = () => {
  const [bounties, setBounties] = useState<SkillBounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingBounty, setClaimingBounty] = useState<number | null>(null);

  useEffect(() => {
    loadBounties();
  }, []);

  const loadBounties = async () => {
    try {
      setLoading(true);
      // In a real implementation, you'd fetch all bounties from the contract
      // For now, we'll show sample bounties
      const sampleBounties: SkillBounty[] = [
        {
          bountyId: 1,
          employer: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          title: 'React Frontend Developer Needed',
          description: 'Looking for an experienced React developer to build a modern web application with TypeScript and Tailwind CSS.',
          requiredSkills: ['React', 'TypeScript', 'Tailwind CSS'],
          rewardAmount: 500000, // 0.5 STX
          isActive: true,
          winner: undefined,
          createdAt: Date.now() - 86400000, // 1 day ago
        },
        {
          bountyId: 2,
          employer: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          title: 'Smart Contract Security Audit',
          description: 'Need a blockchain security expert to audit our Clarity smart contracts for vulnerabilities.',
          requiredSkills: ['Clarity', 'Smart Contracts', 'Security'],
          rewardAmount: 1000000, // 1.0 STX
          isActive: true,
          winner: undefined,
          createdAt: Date.now() - 172800000, // 2 days ago
        },
        {
          bountyId: 3,
          employer: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          title: 'Completed: Python Data Analysis',
          description: 'Completed bounty for Python data analysis expert.',
          requiredSkills: ['Python', 'Pandas', 'Data Analysis'],
          rewardAmount: 300000, // 0.3 STX
          isActive: false,
          winner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          createdAt: Date.now() - 259200000, // 3 days ago
        },
      ];

      setBounties(sampleBounties);
    } catch (error) {
      console.error('Error loading bounties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBounty = async (bountyId: number) => {
    try {
      setClaimingBounty(bountyId);
      await claimBounty(bountyId);
      // Refresh bounties after successful claim
      await loadBounties();
    } catch (error) {
      console.error('Error claiming bounty:', error);
    } finally {
      setClaimingBounty(null);
    }
  };

  const activeBounties = bounties.filter(b => b.isActive);
  const completedBounties = bounties.filter(b => !b.isActive);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">Active Bounties</p>
              <p className="text-2xl font-bold text-gray-900">{activeBounties.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatSTX(activeBounties.reduce((sum, b) => sum + b.rewardAmount, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedBounties.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Bounties */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Bounties</h3>
        <div className="space-y-4">
          {activeBounties.map((bounty) => (
            <div key={bounty.bountyId} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{bounty.title}</h4>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">
                        {formatSTX(bounty.rewardAmount)}
                      </div>
                      <div className="text-xs text-gray-500">STX</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{bounty.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {bounty.requiredSkills.map((skill, index) => (
                      <span key={index} className="badge bg-blue-100 text-blue-800">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{Math.floor((Date.now() - bounty.createdAt) / 86400000)} days ago</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{bounty.employer.slice(0, 6)}...{bounty.employer.slice(-4)}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <button
                    onClick={() => handleClaimBounty(bounty.bountyId)}
                    disabled={claimingBounty === bounty.bountyId}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {claimingBounty === bounty.bountyId ? 'Claiming...' : 'Claim Bounty'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Bounties */}
      {completedBounties.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Bounties</h3>
          <div className="space-y-4">
            {completedBounties.map((bounty) => (
              <div key={bounty.bountyId} className="card opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{bounty.title}</h4>
                      <span className="badge-success">Completed</span>
                    </div>

                    <p className="text-gray-600 mb-2">{bounty.description}</p>

                    <div className="text-sm text-gray-500">
                      Winner: {bounty.winner?.slice(0, 6)}...{bounty.winner?.slice(-4)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bounties.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bounties available</h3>
          <p className="text-gray-600 mb-4">
            Check back later for new skill-based opportunities.
          </p>
        </div>
      )}
    </div>
  );
};

export default BountyBoard;
