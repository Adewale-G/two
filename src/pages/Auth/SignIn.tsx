import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Layout/Logo';

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setError('Invalid credentials. Please try again.');
    } else {
      navigate('/');
    }

    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDemoLogin = (role: string) => {
    setFormData({
      email: `${role}@pineappl.edu`,
      password: 'demo123',
      rememberMe: false
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 relative">
      {/* Bolt Logo - Top Right */}
      <div className="absolute top-4 right-4 flex items-center space-x-3">
        <a 
          href="https://bolt.new/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:scale-105 transition-transform"
        >
          <img 
            src="/black_circle_360x360.png" 
            alt="Powered by Bolt" 
            className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          />
        </a>
      </div>

      {/* Sign In Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <Logo size="lg" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Pineappl</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Academic Performance Platform</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-4">
            <button className="flex-1 py-2 px-3 text-center text-white bg-emerald-600 rounded-l-lg font-medium text-sm">
              SIGN IN
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="flex-1 py-2 px-3 text-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-r-lg font-medium hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
            >
              SIGN UP
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-3 h-3 text-emerald-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-emerald-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                Stay signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-xs transition-colors">
              Forgot Password?
            </button>
          </div>

          {/* Demo Accounts */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-xs text-center mb-2">Quick Demo Login:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('admin')}
                className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded text-xs hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors"
              >
                Admin
              </button>
              <button
                onClick={() => handleDemoLogin('lecturer')}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                Lecturer
              </button>
              <button
                onClick={() => handleDemoLogin('student')}
                className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;