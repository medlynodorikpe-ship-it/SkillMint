import React, { useState } from 'react';
import { X, Briefcase, DollarSign, Plus, X as RemoveIcon } from 'lucide-react';
import { createSkillBounty } from '../utils/stacks';

interface CreateBountyModalProps {
  onClose: () => void;
}

const CreateBountyModal: React.FC<CreateBountyModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [''],
    rewardAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const validSkills = formData.requiredSkills.filter(skill => skill.trim());
    if (validSkills.length === 0) {
      setError('Please add at least one required skill');
      return;
    }

    if (formData.rewardAmount <= 0) {
      setError('Reward amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createSkillBounty(
        formData.title,
        formData.description,
        validSkills,
        formData.rewardAmount
      );

      onClose();
    } catch (err) {
      console.error('Error creating bounty:', err);
      setError('Failed to create bounty. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, '']
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.map((skill, i) => i === index ? value : skill)
    }));
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
              <Briefcase className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Create Skill Bounty</h2>
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
                Bounty Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., React Frontend Developer Needed"
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
                placeholder="Describe the project and requirements..."
                className="input-field"
                rows={4}
                maxLength={512}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/512 characters
              </p>
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills *
              </label>
              <div className="space-y-2">
                {formData.requiredSkills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      placeholder="e.g., React, JavaScript"
                      className="input-field flex-1"
                      maxLength={64}
                    />
                    {formData.requiredSkills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <RemoveIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSkill}
                className="mt-2 flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800"
              >
                <Plus className="w-4 h-4" />
                <span>Add another skill</span>
              </button>
            </div>

            {/* Reward Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Amount (STX) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={formData.rewardAmount}
                  onChange={(e) => handleInputChange('rewardAmount', parseInt(e.target.value) || 0)}
                  placeholder="0.000000"
                  className="input-field pl-10"
                  min="0"
                  step="0.000001"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Amount in STX to reward the successful candidate
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
                {loading ? 'Creating...' : 'Create Bounty'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBountyModal;
