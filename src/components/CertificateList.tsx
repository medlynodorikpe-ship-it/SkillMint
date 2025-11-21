import React, { useState, useEffect } from 'react';
import { Award, Calendar, Clock, TrendingUp, Star } from 'lucide-react';
import { getSkillCertificate, getSkillLevelColor } from '../utils/stacks';
import type { SkillCertificate } from '../types';

const CertificateList: React.FC = () => {
  const [certificates, setCertificates] = useState<SkillCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      // In a real implementation, you'd fetch user's certificates from the contract
      // For now, we'll show sample certificates
      const sampleCertificates: SkillCertificate[] = [
        {
          certificateId: 1,
          owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          skillCategory: 'React Development',
          skillLevel: 85,
          lessonsCompleted: [1, 2, 3],
          peerReviews: [1, 2],
          averageScore: 85,
          certifiedAt: Date.now() - 604800000, // 1 week ago
          expiresAt: Date.now() + 7776000000, // ~90 days from now
          isComposite: false,
        },
        {
          certificateId: 2,
          owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          skillCategory: 'Full Stack Web Development',
          skillLevel: 100,
          lessonsCompleted: [1, 2, 3, 4, 5],
          peerReviews: [3, 4, 5],
          averageScore: 100,
          certifiedAt: Date.now() - 2592000000, // 30 days ago
          expiresAt: Date.now() + 5184000000, // ~60 days from now
          isComposite: true,
        },
      ];

      setCertificates(sampleCertificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiresAt: number) => {
    const now = Date.now();
    const daysLeft = Math.floor((expiresAt - now) / 86400000);

    if (daysLeft < 0) return { status: 'expired', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (daysLeft <= 7) return { status: 'expiring', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { status: 'valid', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
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
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Average Skill Level</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.length > 0
                  ? Math.round(certificates.reduce((sum, cert) => sum + cert.skillLevel, 0) / certificates.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Composite Skills</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.filter(cert => cert.isComposite).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        {certificates.map((certificate) => {
          const expiryInfo = getExpiryStatus(certificate.expiresAt);

          return (
            <div key={certificate.certificateId} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Award className="w-6 h-6 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {certificate.skillCategory}
                    </h3>
                    {certificate.isComposite && (
                      <span className="badge bg-purple-100 text-purple-800">
                        Composite
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Skill Level</p>
                      <div className="flex items-center space-x-2">
                        <div className={`badge ${getSkillLevelColor(Math.ceil(certificate.skillLevel / 20))}`}>
                          {certificate.skillLevel}/100
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Lessons Completed</p>
                      <p className="font-medium text-gray-900">{certificate.lessonsCompleted.length}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Peer Reviews</p>
                      <p className="font-medium text-gray-900">{certificate.peerReviews.length}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Expires</p>
                      <div className={`badge ${expiryInfo.bgColor} ${expiryInfo.color}`}>
                        {expiryInfo.status === 'expired' ? 'Expired' :
                         expiryInfo.status === 'expiring' ? 'Soon' :
                         `${Math.floor((certificate.expiresAt - Date.now()) / 86400000)}d`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Certified {Math.floor((Date.now() - certificate.certifiedAt) / 86400000)} days ago</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  <button className="btn-primary text-sm">
                    View Details
                  </button>
                  <button className="btn-secondary text-sm">
                    Share Certificate
                  </button>
                  {expiryInfo.status !== 'expired' && (
                    <button className="btn-secondary text-sm">
                      Renew
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {certificates.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
          <p className="text-gray-600 mb-4">
            Complete lessons and earn peer-reviewed skill certificates.
          </p>
          <button className="btn-primary">
            Start Learning
          </button>
        </div>
      )}
    </div>
  );
};

export default CertificateList;
