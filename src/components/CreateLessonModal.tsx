import React, { useState } from 'react';
import { X, BookOpen, DollarSign } from 'lucide-react';
import { createLessonPlan } from '../utils/stacks';

interface CreateLessonModalProps {
  onClose: () => void;
}

const CreateLessonModal: React.FC<CreateLessonModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillCategory: '',
    difficulty: 1,
    price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.skillCategory.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createLessonPlan(
        formData.title,
        formData.description,
        formData.skillCategory,
        formData.difficulty,
        formData.price
      );

      onClose();
    } catch (err) {
      console.error('Error creating lesson:', err);
      setError('Failed to create lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Create New Lesson</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Introduction to React Hooks"
                className="input-field"
                maxLength={128}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what students will learn..."
                className="input-field"
                rows={4}
                maxLength={512}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/512 characters
              </p>
            </div>

            {/* Skill Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Category *
              </label>
              <input
                type="text"
                value={formData.skillCategory}
                onChange={(e) => handleInputChange('skillCategory', e.target.value)}
                placeholder="e.g., React, JavaScript, Python"
                className="input-field"
                maxLength={64}
                required
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
                className="input-field"
              >
                <option value={1}>Beginner</option>
                <option value={2}>Intermediate</option>
                <option value={3}>Advanced</option>
                <option value={4}>Expert</option>
                <option value={5}>Master</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (STX)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                  placeholder="0.000000"
                  className="input-field pl-10"
                  min="0"
                  step="0.000001"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Price in STX (microSTX will be calculated automatically)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Lesson'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLessonModal;
