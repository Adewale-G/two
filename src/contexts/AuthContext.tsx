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
          // Get user profile from database
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select(`
              id, 
              email, 
              full_name, 
              role, 
              bio, 
              phone, 
              address, 
              date_of_birth, 
              avatar_url,
              departments(name),
              faculties(name)
            `)  
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            throw profileError;
          }

          if (profile) {
            setUser({
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
            });
          }
        } else {
          // No session, check for demo user in localStorage
          const savedUser = localStorage.getItem('pineappl_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Fallback to localStorage for demo users
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
        // Fetch user profile when signed in
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            id, 
            email, 
            full_name, 
            role, 
            bio, 
            phone, 
            address, 
            date_of_birth, 
            avatar_url,
            departments(name),
            faculties(name)
          `)
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const userData = {
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
          setUser(userData);
          localStorage.setItem('pineappl_user', JSON.stringify(userData));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('pineappl_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // If Supabase auth fails, try demo user fallback
        console.log('Supabase auth failed, using demo user:', error.message);
        
        const demoUser = createDemoUser(email);
        localStorage.setItem('pineappl_user', JSON.stringify(demoUser));
        setUser(demoUser);
        setLoading(false);
        return { error: null };
      }

      if (data.user) {
        // Profile will be set by the auth state change listener
        setLoading(false);
        return { error: null };
      }

      setLoading(false);
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
      return { error };
    }
  };

  const signUp = async (signupData: any) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.full_name,
            role: signupData.role,
            username: signupData.username,
            phone: signupData.phone,
            date_of_birth: signupData.date_of_birth,
            address: signupData.address,
            faculty_id: signupData.faculty_id,
            department_id: signupData.department_id
          }
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        setLoading(false);
        return { error };
      }

      if (data.user) {
        // The trigger function will automatically create the profile
        console.log('User signed up successfully:', data.user.id);
        setLoading(false);
        return { error: null };
      }

      setLoading(false);
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
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

      // Also update in Supabase if user is authenticated
      try {
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
      } catch (error) {
        console.error('Profile update error:', error);
      }
    }
  };

  // Helper function to create demo users
  const createDemoUser = (email: string): User => {
    const userId = `demo-${Date.now()}`;
    
    if (email.includes('admin')) {
      return {
        id: userId,
        name: 'Admin User',
        email,
        role: 'admin',
        department: 'Administration',
        faculty: 'Administration',
        avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        bio: 'University administrator.',
        phone: '+234 801 234 5678',
        address: 'Admin Block',
        dateOfBirth: '1985-05-15'
      };
    } else if (email.includes('lecturer')) {
      return {
        id: userId,
        name: 'Dr. Sarah Wilson',
        email,
        role: 'lecturer',
        department: 'Computer Science',
        faculty: 'COPAS',
        avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
        bio: 'Lecturer in AI.',
        phone: '+234 802 345 6789',
        address: 'Faculty Housing',
        dateOfBirth: '1980-08-22'
      };
    } else {
      return {
        id: userId,
        name: 'John Student',
        email,
        role: 'student',
        department: 'Computer Science',
        faculty: 'COPAS',
        avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        bio: 'CS Student.',
        phone: '+234 803 456 7890',
        address: 'Student Hostel',
        dateOfBirth: '2000-03-10'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      switchRole, 
      updateUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};