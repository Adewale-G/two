import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type UserRole = 'student' | 'lecturer' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  faculty?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

interface ProfileUpdateData {
  name?: string;
  email?: string;
  department?: string;
  faculty?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (data: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (data: ProfileUpdateData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          await loadUserProfile(session.user.id);
        } else {
          // Check for demo user in localStorage
          const savedUser = localStorage.getItem('pineappl_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Fallback to localStorage
        const fallbackUser = localStorage.getItem('pineappl_user');
        if (fallbackUser) {
          setUser(JSON.parse(fallbackUser));
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('pineappl_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id, email, full_name, role, bio, phone, address, date_of_birth, avatar_url,
          departments(name), faculties(name)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        const userProfile: User = {
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          role: profile.role,
          department: profile.departments?.name,
          faculty: profile.faculties?.name,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          phone: profile.phone,
          address: profile.address,
          dateOfBirth: profile.date_of_birth
        };

        setUser(userProfile);
        localStorage.setItem('pineappl_user', JSON.stringify(userProfile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        // If Supabase auth fails, check for demo users
        const demoUsers: Record<string, User> = {
          'admin@pineappl.edu': {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Admin User',
            email: 'admin@pineappl.edu',
            role: 'admin',
            department: 'Administration',
            faculty: 'Administration',
            avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
            bio: 'University administrator.',
            phone: '+234 801 234 5678',
            address: 'Admin Block',
            dateOfBirth: '1985-05-15'
          },
          'lecturer@pineappl.edu': {
            id: '550e8400-e29b-41d4-a716-446655440002',
            name: 'Dr. Sarah Wilson',
            email: 'lecturer@pineappl.edu',
            role: 'lecturer',
            department: 'Computer Science',
            faculty: 'COPAS',
            avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
            bio: 'Lecturer in AI.',
            phone: '+234 802 345 6789',
            address: 'Faculty Housing',
            dateOfBirth: '1980-08-22'
          },
          'student@pineappl.edu': {
            id: '550e8400-e29b-41d4-a716-446655440003',
            name: 'John Student',
            email: 'student@pineappl.edu',
            role: 'student',
            department: 'Computer Science',
            faculty: 'COPAS',
            avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
            bio: 'CS Student.',
            phone: '+234 803 456 7890',
            address: 'Student Hostel',
            dateOfBirth: '2000-03-10'
          }
        };

        if (demoUsers[email] && password === 'demo123') {
          const demoUser = demoUsers[email];
          localStorage.setItem('pineappl_user', JSON.stringify(demoUser));
          setUser(demoUser);
          setLoading(false);
          return { error: null };
        }

        setLoading(false);
        return { error };
      }

      // User profile will be loaded by the auth state change listener
      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signUp = async (signupData: any) => {
    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.full_name,
            username: signupData.username,
            role: signupData.role
          }
        }
      });

      if (authError) {
        setLoading(false);
        return { error: authError };
      }

      if (authData.user) {
        // Profile will be created automatically by the trigger
        // But we can update it with additional information
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            date_of_birth: signupData.date_of_birth,
            phone: signupData.phone,
            address: signupData.address,
            faculty_id: signupData.faculty_id,
            department_id: signupData.department_id,
            matric_number: signupData.role === 'student' ? signupData.matric_number : null,
            staff_id: signupData.role !== 'student' ? signupData.staff_id : null,
            bio: `${signupData.role} at the university`,
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          // Don't fail the signup for profile update errors
        }
      }

      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('pineappl_user');
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('pineappl_user', JSON.stringify(updatedUser));
    }
  };

  const updateUserProfile = async (data: ProfileUpdateData) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('pineappl_user', JSON.stringify(updatedUser));

      // Update in Supabase if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('profiles')
          .update({
            full_name: data.name,
            phone: data.phone,
            address: data.address,
            date_of_birth: data.dateOfBirth,
            bio: data.bio,
            avatar_url: data.avatarUrl
          })
          .eq('id', user.id);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, switchRole, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};