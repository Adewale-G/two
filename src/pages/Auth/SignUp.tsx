
import Logo from '../../components/Layout/Logo';
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, School, ArrowRight, Calendar, User, Mail, Phone, MapPin, GraduationCap, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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

  // Generate consistent UUIDs for mock data
  const mockFacultyIds = {
    copas: '550e8400-e29b-41d4-a716-446655440001',
    colensma: '550e8400-e29b-41d4-a716-446655440002',
    casmas: '550e8400-e29b-41d4-a716-446655440003',
    colaw: '550e8400-e29b-41d4-a716-446655440004',
    nursing: '550e8400-e29b-41d4-a716-446655440005'
  };

  const mockDepartmentIds = {
    computerScience: '550e8400-e29b-41d4-a716-446655440011',
    biochemistry: '550e8400-e29b-41d4-a716-446655440012',
    softwareEngineering: '550e8400-e29b-41d4-a716-446655440013',
    architecture: '550e8400-e29b-41d4-a716-446655440014',
    estateManagement: '550e8400-e29b-41d4-a716-446655440015',
    businessAdmin: '550e8400-e29b-41d4-a716-446655440016',
    accounting: '550e8400-e29b-41d4-a716-446655440017',
    economics: '550e8400-e29b-41d4-a716-446655440018',
    publicLaw: '550e8400-e29b-41d4-a716-446655440019',
    privateLaw: '550e8400-e29b-41d4-a716-446655440020',
    nursingScience: '550e8400-e29b-41d4-a716-446655440021',
    humanPhysiology: '550e8400-e29b-41d4-a716-446655440022'
  };

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
        .select('id, name, full_name');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setFaculties(data);
      } else {
        // Fallback to mock data if no faculties in database
        const mockFaculties = [
          { id: mockFacultyIds.copas, name: 'COPAS', full_name: 'College of Pure and Applied Sciences' },
          { id: mockFacultyIds.colensma, name: 'COLENSMA', full_name: 'College of Environmental Sciences and Management' },
          { id: mockFacultyIds.casmas, name: 'CASMAS', full_name: 'College of Art, Social, and Management Science' },
          { id: mockFacultyIds.colaw, name: 'COLAW', full_name: 'College of Law' },
          { id: mockFacultyIds.nursing, name: 'NURSING', full_name: 'College of Nursing and Basic Medical Sciences' }
        ];
        setFaculties(mockFaculties);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
      // Use mock data as fallback
      const mockFaculties = [
        { id: mockFacultyIds.copas, name: 'COPAS', full_name: 'College of Pure and Applied Sciences' },
        { id: mockFacultyIds.colensma, name: 'COLENSMA', full_name: 'College of Environmental Sciences and Management' },
        { id: mockFacultyIds.casmas, name: 'CASMAS', full_name: 'College of Art, Social, and Management Science' },
        { id: mockFacultyIds.colaw, name: 'COLAW', full_name: 'College of Law' },
        { id: mockFacultyIds.nursing, name: 'NURSING', full_name: 'College of Nursing and Basic Medical Sciences' }
      ];
      setFaculties(mockFaculties);
    }
  };

  const fetchDepartments = async (facultyId: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, faculty_id')
        .eq('faculty_id', facultyId);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setDepartments(data);
      } else {
        // Fallback to mock data
        const mockDepartments: Record<string, Department[]> = {
          [mockFacultyIds.copas]: [
            { id: mockDepartmentIds.computerScience, name: 'Computer Science', faculty_id: mockFacultyIds.copas },
            { id: mockDepartmentIds.biochemistry, name: 'Biochemistry', faculty_id: mockFacultyIds.copas },
            { id: mockDepartmentIds.softwareEngineering, name: 'Software Engineering', faculty_id: mockFacultyIds.copas }
          ],
          [mockFacultyIds.colensma]: [
            { id: mockDepartmentIds.architecture, name: 'Architecture', faculty_id: mockFacultyIds.colensma },
            { id: mockDepartmentIds.estateManagement, name: 'Estate Management', faculty_id: mockFacultyIds.colensma }
          ],
          [mockFacultyIds.casmas]: [
            { id: mockDepartmentIds.businessAdmin, name: 'Business Administration', faculty_id: mockFacultyIds.casmas },
            { id: mockDepartmentIds.accounting, name: 'Accounting', faculty_id: mockFacultyIds.casmas },
            { id: mockDepartmentIds.economics, name: 'Economics', faculty_id: mockFacultyIds.casmas }
          ],
          [mockFacultyIds.colaw]: [
            { id: mockDepartmentIds.publicLaw, name: 'Public and Property Law', faculty_id: mockFacultyIds.colaw },
            { id: mockDepartmentIds.privateLaw, name: 'Private and International Law', faculty_id: mockFacultyIds.colaw }
          ],
          [mockFacultyIds.nursing]: [
            { id: mockDepartmentIds.nursingScience, name: 'Nursing Science', faculty_id: mockFacultyIds.nursing },
            { id: mockDepartmentIds.humanPhysiology, name: 'Human Physiology', faculty_id: mockFacultyIds.nursing }
          ]
        };
        setDepartments(mockDepartments[facultyId] || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Use mock data as fallback
      const mockDepartments: Record<string, Department[]> = {
        [mockFacultyIds.copas]: [
          { id: mockDepartmentIds.computerScience, name: 'Computer Science', faculty_id: mockFacultyIds.copas },
          { id: mockDepartmentIds.biochemistry, name: 'Biochemistry', faculty_id: mockFacultyIds.copas },
          { id: mockDepartmentIds.softwareEngineering, name: 'Software Engineering', faculty_id: mockFacultyIds.copas }
        ],
        [mockFacultyIds.colensma]: [
          { id: mockDepartmentIds.architecture, name: 'Architecture', faculty_id: mockFacultyIds.colensma },
          { id: mockDepartmentIds.estateManagement, name: 'Estate Management', faculty_id: mockFacultyIds.colensma }
        ],
        [mockFacultyIds.casmas]: [
          { id: mockDepartmentIds.businessAdmin, name: 'Business Administration', faculty_id: mockFacultyIds.casmas },
          { id: mockDepartmentIds.accounting, name: 'Accounting', faculty_id: mockFacultyIds.casmas },
          { id: mockDepartmentIds.economics, name: 'Economics', faculty_id: mockFacultyIds.casmas }
        ],
        [mockFacultyIds.colaw]: [
          { id: mockDepartmentIds.publicLaw, name: 'Public and Property Law', faculty_id: mockFacultyIds.colaw },
          { id: mockDepartmentIds.privateLaw, name: 'Private and International Law', faculty_id: mockFacultyIds.colaw }
        ],
        [mockFacultyIds.nursing]: [
          { id: mockDepartmentIds.nursingScience, name: 'Nursing Science', faculty_id: mockFacultyIds.nursing },
          { id: mockDepartmentIds.humanPhysiology, name: 'Human Physiology', faculty_id: mockFacultyIds.nursing }
        ]
      };
      setDepartments(mockDepartments[facultyId] || []);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    try {
      // Validate UUIDs
      const isValidUUID = (value: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

      const safeFacultyId = isValidUUID(formData.faculty_id) ? formData.faculty_id : null;
      const safeDepartmentId = isValidUUID(formData.department_id) ? formData.department_id : null;

      // Create user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            username: formData.username,
            role: formData.role
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (authData.user) {
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the profile with additional information
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            username: formData.username,
            role: formData.role,
            date_of_birth: formData.date_of_birth || null,
            phone: formData.phone || null,
            address: formData.address || null,
            faculty_id: safeFacultyId,
            department_id: safeDepartmentId,
            matric_number: formData.role === 'student' ? formData.matric_number : null,
            staff_id: (formData.role === 'lecturer' || formData.role === 'admin') ? formData.staff_id : null,
            is_verified: false
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
          // Don't throw here - the user was created successfully
          console.warn('Profile update failed, but user was created');
        }

        // Success - redirect to sign in
        navigate('/signin', { 
          state: { 
            message: 'Account created successfully! Please check your email to verify your account, then sign in.',
            email: formData.email
          }
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-2">
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleInputChange}
          className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
          className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
          className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10 text-sm"
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
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10 text-sm"
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
    <div className="space-y-2">
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleInputChange}
          className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
          className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
          className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-2">
      <div>
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
          className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          required
        >
          <option value="">Select Faculty</option>
          {faculties.map(faculty => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
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
          className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            required
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
      {/* Logos - Top Right */}
      <div className="absolute top-4 right-4 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img 
            src="/pineapple.jpeg" 
            alt="Pineappl Logo" 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-teal-600', 'flex', 'items-center', 'justify-center');
                parent.innerHTML += `<div class="text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg></div>`;
              }
            }}
          />
        </div>
        <a 
          href="https://bolt.new/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:scale-105 transition-transform"
        >
          <img 
            src="/black_circle_360x360.png" 
            alt="Powered by Bolt" 
            className="w-8 h-8 rounded-full shadow-md hover:shadow-lg transition-shadow"
          />
        </a>
      </div>

      {/* Sign Up Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-3">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <School className="h-5 w-5 text-white" />
              </div>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Pineappl</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Academic Performance Platform</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-3">
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
          <div className="flex items-center justify-center mb-3">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  step <= currentStep 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-4 h-0.5 ${
                    step < currentStep ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Headers */}
          <div className="text-center mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {currentStep === 1 ? 'Basic Information' : 
               currentStep === 2 ? 'Personal Information' : 
               'Academic Information'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              {currentStep === 1 ? "Let's start with your basic details" : 
               currentStep === 2 ? 'Tell us more about yourself' : 
               'Complete your academic profile'}
            </p>
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
            <div className="flex space-x-2 mt-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <span>Next</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
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
          <div className="text-center mt-2">
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