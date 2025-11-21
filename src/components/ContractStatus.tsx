import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getContractStatus } from '../utils/stacks';
import type { ContractStatus as ContractStatusType } from '../types';

interface ContractStatusProps {
  status: ContractStatusType | null;
}

const ContractStatus: React.FC<ContractStatusProps> = ({ status }) => {
  const [localStatus, setLocalStatus] = useState<ContractStatusType | null>(status);

  useEffect(() => {
    if (!status) {
      getContractStatus().then(setLocalStatus).catch(console.error);
    } else {
      setLocalStatus(status);
    }
  }, [status]);

  if (!localStatus) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 text-sm">
      {/* Contract Paused Status */}
      <div className="flex items-center space-x-1">
        {localStatus.isPaused ? (
          <>
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700">Paused</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-700">Active</span>
          </>
        )}
      </div>

      {/* Emergency Mode Status */}
      {localStatus.isEmergency && (
        <div className="flex items-center space-x-1">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <span className="text-orange-700">Emergency</span>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center space-x-3 text-gray-600">
        <span>Lessons: {localStatus.totalLessons}</span>
        <span>Certificates: {localStatus.totalCertificates}</span>
      </div>
    </div>
  );
};

export default ContractStatus;
