import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  BookOpen,
  Users,
  Star,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

interface UserStats {
  totalLessonsCompleted: number;
  totalCertificates: number;
  averageScore: number;
  totalPeerReviews: number;
  skillsLearned: string[];
  reputationScore: number;
  streakDays: number;
  totalEarnings: number;
}

const MyStats: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // In a real implementation, you'd fetch user stats from the contract
      // For now, we'll show sample stats
      const sampleStats: UserStats = {
        totalLessonsCompleted: 24,
        totalCertificates: 5,
        averageScore: 87,
        totalPeerReviews: 12,
        skillsLearned: ['React', 'JavaScript', 'TypeScript', 'Smart Contracts', 'Python'],
        reputationScore: 4.8,
        streakDays: 7,
        totalEarnings: 250000, // 0.25 STX
      };

      setStats(sampleStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">Lessons Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLessonsCompleted}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Certificates Earned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Peer Reviews Given</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPeerReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Streak</span>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="font-medium">{stats.streakDays} days</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reputation Score</span>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="font-medium">{stats.reputationScore}/5.0</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Earnings</span>
              <span className="font-medium text-green-600">
                {(stats.totalEarnings / 1000000).toFixed(6)} STX
              </span>
            </div>
          </div>
        </div>

        {/* Skills Learned */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Mastered</h3>
          <div className="flex flex-wrap gap-2">
            {stats.skillsLearned.map((skill, index) => (
              <span
                key={index}
                className="badge bg-primary-100 text-primary-800"
              >
                {skill}
              </span>
            ))}
          </div>

          {stats.skillsLearned.length === 0 && (
            <p className="text-gray-500 text-sm">No skills certified yet</p>
          )}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.totalLessonsCompleted >= 10 && (
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-900">Dedicated Learner</p>
              <p className="text-xs text-blue-700">10+ lessons completed</p>
            </div>
          )}

          {stats.averageScore >= 90 && (
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900">High Achiever</p>
              <p className="text-xs text-green-700">90%+ average score</p>
            </div>
          )}

          {stats.totalCertificates >= 3 && (
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-900">Certified Expert</p>
              <p className="text-xs text-purple-700">3+ certificates earned</p>
            </div>
          )}

          {stats.reputationScore >= 4.5 && (
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-yellow-900">Top Reviewer</p>
              <p className="text-xs text-yellow-700">4.5+ reputation score</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Completed "Advanced React Patterns" lesson</p>
              <p className="text-xs text-gray-500">2 hours ago • Score: 95%</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Award className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Earned "React Development" certificate</p>
              <p className="text-xs text-gray-500">1 day ago • Skill Level: 88/100</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Reviewed skill certification for Alice</p>
              <p className="text-xs text-gray-500">2 days ago • Score given: 92/100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStats;
