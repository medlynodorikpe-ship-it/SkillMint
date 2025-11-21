import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  Plus,
  Search
} from 'lucide-react';
import LessonList from './LessonList';
import CertificateList from './CertificateList';
import BountyBoard from './BountyBoard';
import MyStats from './MyStats';
import CreateLessonModal from './CreateLessonModal';
import CreateBountyModal from './CreateBountyModal';

type TabType = 'lessons' | 'certificates' | 'bounties' | 'stats' | 'create';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('lessons');
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [showCreateBounty, setShowCreateBounty] = useState(false);

  const tabs = [
    { id: 'lessons' as TabType, label: 'Lessons', icon: BookOpen },
    { id: 'certificates' as TabType, label: 'Certificates', icon: Award },
    { id: 'bounties' as TabType, label: 'Bounties', icon: Briefcase },
    { id: 'stats' as TabType, label: 'My Stats', icon: BarChart3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'lessons':
        return <LessonList />;
      case 'certificates':
        return <CertificateList />;
      case 'bounties':
        return <BountyBoard />;
      case 'stats':
        return <MyStats />;
      default:
        return <LessonList />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your skills, certifications, and learning journey
          </p>
        </div>

        <div className="flex space-x-3">
          {activeTab === 'lessons' && (
            <button
              onClick={() => setShowCreateLesson(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lesson</span>
            </button>
          )}

          {activeTab === 'bounties' && (
            <button
              onClick={() => setShowCreateBounty(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Bounty</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>

      {/* Modals */}
      {showCreateLesson && (
        <CreateLessonModal onClose={() => setShowCreateLesson(false)} />
      )}

      {showCreateBounty && (
        <CreateBountyModal onClose={() => setShowCreateBounty(false)} />
      )}
    </div>
  );
};

export default Dashboard;
