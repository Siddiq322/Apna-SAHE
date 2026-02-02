import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '../../services/authService';

interface GoogleSignUpFormProps {
  tempUser: User;
  userName: string;
  userEmail: string;
  onComplete: (userData: any) => void;
  onError: (error: string) => void;
}

export const GoogleSignUpForm: React.FC<GoogleSignUpFormProps> = ({
  tempUser,
  userName,
  userEmail,
  onComplete,
  onError
}) => {
  const [formData, setFormData] = useState({
    name: userName,
    branch: '',
    semester: ''
  });
  const [loading, setLoading] = useState(false);

  const branches = [
    'Computer Science and Engineering',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Information Technology',
    'Biotechnology',
    'Aeronautical Engineering',
    'Automobile Engineering',
    'Mining Engineering',
    'Metallurgy and Materials Engineering',
    'Textile Technology',
    'Food Technology',
    'Environmental Engineering',
    'Marine Engineering',
    'Petroleum Engineering',
    'Instrumentation Engineering',
    'Production Engineering',
    'Industrial Engineering',
    'Agricultural Engineering',
    'Forestry Engineering'
  ];

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.branch || !formData.semester) {
      onError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.completeGoogleSignUp(tempUser, {
        name: formData.name,
        branch: formData.branch,
        semester: formData.semester
      });
      onComplete(result);
    } catch (error: any) {
      onError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600">Signed in with: {userEmail}</p>
          <p className="text-sm text-gray-500 mt-2">Please provide additional information to complete your registration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              id="branch"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select your branch</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
              Current Semester
            </label>
            <select
              id="semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select your semester</option>
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-950 text-white font-bold py-3 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};