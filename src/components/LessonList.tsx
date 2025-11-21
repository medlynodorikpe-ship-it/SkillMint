import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Clock, DollarSign, Users } from 'lucide-react';
import { getLessonPlan, getDifficultyLabel, formatSTX } from '../utils/stacks';
import type { Lesson } from '../types';

const LessonList: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      // In a real implementation, you'd fetch all lessons from the contract
      // For now, we'll show a sample lesson
      const sampleLessons: Lesson[] = [
        {
          lessonId: 1,
          creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          title: 'Introduction to React',
          description: 'Learn the fundamentals of React development including components, state, and props.',
          skillCategory: 'Programming',
          difficulty: 2,
          price: 50000, // 0.05 STX
          completionCount: 25,
          createdAt: Date.now() - 86400000, // 1 day ago
        },
        {
          lessonId: 2,
          creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          title: 'Advanced JavaScript',
          description: 'Master advanced JavaScript concepts including closures, prototypes, and async programming.',
          skillCategory: 'Programming',
          difficulty: 4,
          price: 100000, // 0.1 STX
          completionCount: 12,
          createdAt: Date.now() - 172800000, // 2 days ago
        },
      ];

      setLessons(sampleLessons);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lesson.skillCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(lessons.map(l => l.skillCategory))];

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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field sm:w-48"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <div key={lesson.lessonId} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`badge ${getDifficultyLabel(lesson.difficulty).toLowerCase()}-level`}>
                {getDifficultyLabel(lesson.difficulty)}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatSTX(lesson.price)}
                </div>
                <div className="text-xs text-gray-500">STX</div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {lesson.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {lesson.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{lesson.completionCount} completed</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{Math.floor((Date.now() - lesson.createdAt) / 86400000)}d ago</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 btn-primary text-sm">
                Start Learning
              </button>
              <button className="flex-1 btn-secondary text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filters to find more lessons.
          </p>
        </div>
      )}
    </div>
  );
};

export default LessonList;
