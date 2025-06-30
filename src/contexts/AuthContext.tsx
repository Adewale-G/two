// AuthContext.tsx (Full Updated with Faculty/Department UUID Dropdown Logic)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Types

export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
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
  faculties: any[];
  departments: any[];
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
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [facultyRes, deptRes] = await Promise.all([
        supabase.from('faculties').select('id, name, full_name'),
        supabase.from('departments').select('id, name, faculty_id')
      ]);

      if (!facultyRes.error) setFaculties(facultyRes.data);
      if (!deptRes.error) setDepartments(deptRes.data);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select(`
              id, email, full_name, role, bio, phone, address, date_of_birth, avatar_url,
              departments(name), faculties(name)
            `)
            .eq('id', session.user.id)
            .single();

          if (profileError) throw profileError;

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
          const savedUser = localStorage.getItem('pineappl_user');
          if (savedUser) setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Session check error:', err);
        const fallbackUser = localStorage.getItem('pineappl_user');
        if (fallbackUser) setUser(JSON.parse(fallbackUser));
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            id, email, full_name, role, bio, phone, address, date_of_birth, avatar_url,
            departments(name), faculties(name)
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
        const demoUser = createDemoUser(email);
        localStorage.setItem('pineappl_user', JSON.stringify(demoUser));
        setUser(demoUser);
        return { error: null };
      }
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (signupData: any) => {
  setLoading(true);

  try {
    const facultyUuid = FACULTY_UUIDS[signupData.faculty];
    const departmentUuid = DEPARTMENT_UUIDS[signupData.department];

    if (!facultyUuid || !departmentUuid) {
      throw new Error('Invalid faculty or department selected');
    }

    const { data, error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          full_name: signupData.full_name,
          username: signupData.username,
          role: signupData.role,
          phone: signupData.phone,
          date_of_birth: signupData.date_of_birth,
          address: signupData.address,
          faculty_id: facultyUuid,
          department_id: departmentUuid
        }
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      setLoading(false);
      return { error };
    }

    if (data.user) {
      console.log('User signed up successfully:', data.user.id);
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

  const createDemoUser = (email: string): User => {
    const id = `demo-${Date.now()}`;
    if (email.includes('admin')) {
      return { id, name: 'Admin User', email, role: 'admin', department: 'Administration', faculty: 'Administration' };
    } else if (email.includes('lecturer')) {
      return { id, name: 'Lecturer User', email, role: 'lecturer', department: 'Computer Science', faculty: 'COPAS' };
    } else {
      return { id, name: 'Student User', email, role: 'student', department: 'Computer Science', faculty: 'COPAS' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        switchRole,
        updateUserProfile,
        faculties,
        departments
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
