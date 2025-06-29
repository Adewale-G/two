import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, School, ArrowRight, Calendar, User, Mail, Phone, MapPin, GraduationCap, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Logo from '../../components/Layout/Logo';

interface Faculty {
  id: string;
  name: string;
  full_name: string;
}

interface Department {
  id: string;
  name: string;
  faculty_id: string;
}

const SignUp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    full_name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Personal Info
    date_of_birth: '',
    phone: '',
    address: '',
    
    // Step 3: Academic Info
    role: 'student' as 'student' | 'lecturer' | 'admin',
    faculty_id: '',
    department_id: '',
    matric_number: '',
    staff_id: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (formData.faculty_id) {
      fetchDepartments(formData.faculty_id);
    }
  }, [formData.faculty_id]);

  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('id, name, full_name')
        .order('name');

      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      // Fallback to mock data
      const mockFaculties = [
        { id: '550e8400-e29b-41d4-a716-446655440010', name: 'COPAS', full_name: 'College of Pure and Applied Sciences' },
        { id: '550e8400-e29b-41d4-a716-446655440012', name: 'COLENSMA', full_name: 'College of Environmental Sciences and Management' },
        { id: '550e8400-e29b-41d4-a716-446655440013', name: 'CASMAS', full_name: 'College of Art, Social, and Management Science' },
        { id: '550e8400-e29b-41d4-a716-446655440014', name: 'COLAW', full_name: 'College of Law' },
        { id: '550e8400-e29b-41d4-a716-446655440015', name: 'NURSING', full_name: 'College of Nursing and Basic Medical Sciences' }
      ];
      setFaculties(mockFaculties);
    }
  };

  const fetchDepartments = async (facultyId: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, faculty_id')
        .eq('faculty_id', facultyId)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Fallback to mock data based on faculty name
      const selectedFaculty = faculties.find(f => f.id === facultyId);
      const mockDepartments: Record<string, Department[]> = {
        'COPAS': [
          { id: '550e8400-e29b-41d4-a716-446655440020', name: 'Computer Science', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440022', name: 'Biochemistry', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440023', name: 'Cyber Security', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440024', name: 'Software Engineering', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440025', name: 'Information Systems', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440026', name: 'Environmental Management and Toxicology', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440027', name: 'Industrial Chemistry', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440028', name: 'Microbiology and Industrial Biotechnology', faculty_id: facultyId }
        ],
        'COLENSMA': [
          { id: '550e8400-e29b-41d4-a716-446655440029', name: 'Architecture', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440030', name: 'Estate Management', faculty_id: facultyId }
        ],
        'CASMAS': [
          { id: '550e8400-e29b-41d4-a716-446655440031', name: 'Business Administration', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440032', name: 'Accounting', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440033', name: 'Economics', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440034', name: 'Mass Communication', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440035', name: 'Psychology', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440036', name: 'Banking and Finance', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440037', name: 'Criminology and Security Studies', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440038', name: 'International Relations', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440039', name: 'Peace Studies and Conflict Resolution', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440040', name: 'Political Science', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440041', name: 'Public Administration', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440042', name: 'Taxation', faculty_id: facultyId }
        ],
        'COLAW': [
          { id: '550e8400-e29b-41d4-a716-446655440043', name: 'Public and Property Law', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440044', name: 'Private and International Law', faculty_id: facultyId }
        ],
        'NURSING': [
          { id: '550e8400-e29b-41d4-a716-446655440045', name: 'Maternal and Child Health Nursing', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440046', name: 'Community and Public Health Nursing', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440047', name: 'Adult Health/Medical and Surgical Nursing', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440048', name: 'Mental Health and Psychiatric Nursing', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440049', name: 'Nursing Management and Education', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440050', name: 'Human Physiology', faculty_id: facultyId },
          { id: '550e8400-e29b-41d4-a716-446655440051', name: 'Human Anatomy', faculty_id: facultyId }
        ]
      };
      setDepartments(mockDepartments[selectedFaculty?.name || ''] || []);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Reset department when faculty changes
    if (name === 'faculty_id') {
      setFormData(prev => ({
        ...prev,
        department_id: ''
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.full_name || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        break;
      case 2:
        if (!formData.date_of_birth || !formData.phone) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 3:
        if (!formData.faculty_id || !formData.department_id) {
          setError('Please select faculty and department');
          return false;
        }
        if (formData.role === 'student' && !formData.matric_number) {
          setError('Matriculation number is required for students');
          return false;
        }
        if ((formData.role === 'lecturer' || formData.role === 'admin') && !formData.staff_id) {
          setError('Staff ID is required for lecturers and admins');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');

    const { error } = await signUp(formData);
    
    if (error) {
      setError(error.message || 'Registration failed. Please try again.');
      setLoading(false);
    } else {
      navigate('/signin', { 
        state: { 
          message: 'Account created successfully! Please sign in with your credentials.' 
        }
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Basic Information</h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs">Let's start with your basic details</p>
      </div>

      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleInputChange}
          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          required
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          required
        />
      </div>

      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleInputChange}
          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative">
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10 text-sm"
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
        >
          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Personal Information</h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs">Tell us more about yourself</p>
      </div>

      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleInputChange}
          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          required
        />
      </div>

      <div className="relative">
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          required
        />
      </div>

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          name="address"
          placeholder="Address (Optional)"
          value={formData.address}
          onChange={handleInputChange}
          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Academic Information</h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs">Complete your academic profile</p>
      </div>

      <div>
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        >
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="relative">
        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <select
          name="faculty_id"
          value={formData.faculty_id}
          onChange={handleInputChange}
          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          required
        >
          <option value="">Select Faculty</option>
          {faculties.map(faculty => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name} - {faculty.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <select
          name="department_id"
          value={formData.department_id}
          onChange={handleInputChange}
          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          required
          disabled={!formData.faculty_id}
        >
          <option value="">Select Department</option>
          {departments.map(department => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      {formData.role === 'student' && (
        <div>
          <input
            type="text"
            name="matric_number"
            placeholder="Matriculation Number"
            value={formData.matric_number}
            onChange={handleInputChange}
            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            required
          />
        </div>
      )}

      {(formData.role === 'lecturer' || formData.role === 'admin') && (
        <div>
          <input
            type="text"
            name="staff_id"
            placeholder="Staff ID"
            value={formData.staff_id}
            onChange={handleInputChange}
            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            required
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 relative">
      {/* Bolt Logo - Top Right */}
      <div className="absolute top-4 right-4">
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

      {/* Sign Up Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <Logo size="md" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Pineappl</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Academic Performance Platform</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-4">
            <button 
              onClick={() => navigate('/signin')}
              className="flex-1 py-2 px-3 text-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-l-lg font-medium hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
            >
              SIGN IN
            </button>
            <button className="flex-1 py-2 px-3 text-center text-white bg-emerald-600 rounded-r-lg font-medium text-sm">
              SIGN UP
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step <= currentStep 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-6 h-0.5 ${
                    step < currentStep ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Form Steps */}
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex space-x-2 mt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-semibold py-2.5 px-3 rounded-lg transition-colors text-sm"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <span>Next</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>CREATE</span>
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-3">
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/signin')}
                className="text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;