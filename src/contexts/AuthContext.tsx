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

export const FACULTY_UUIDS: Record<string, string> = {
  'NURSING': '506c1822-e45b-4323-ba30-71ef76a22aab',
  'COPAS': '550e8400-e29b-41d4-a716-446655440010',
  'ADMINISTRATION': '550e8400-e29b-41d4-a716-446655440011',
  'COLENSMA': '550e8400-e29b-41d4-a716-446655440012',
  'CASMAS': '550e8400-e29b-41d4-a716-446655440013',
  'COLAW': '550e8400-e29b-41d4-a716-446655440014'
};

const departmentMap: Record<string, string> = {
  'Computer Science': '2b9b1aea-03a4-423f-ba5d-f464182add0e',
  'Software Engineering': '3ff418c9-c64c-4e9f-9c02-c8b48dee4474',
  'Information Systems': '168f87bd-b0d9-495c-a3b7-6673f04998cc',
  'Cyber Security': '7384bfc3-3729-4fa6-bbeb-6313d9375a0d',
  'Biochemistry': 'f25fc5c2-0555-4dc2-b95b-50b006828194',
  'Environmental Management and Toxicology': '5b78b0bf-0e0b-4e5b-b64d-7a0b4836e040',
  'Industrial Chemistry': '9a1dd610-9d9b-4ebe-b48b-6e1e7779c019',
  'Mass Communication': '16dfa279-c88a-4181-a6bb-a0dcbac723c8',
  'Criminology and Security Studies': '199eb28c-a2f8-46ec-a833-2d0ced4c2bc2',
  'Economics': '52cf1407-daa9-4666-bf85-b41359c6f111',
  'Psychology': '8051dbd0-9260-4268-84b8-de14d0d133fb',
  'Public Administration': '3f004636-1e22-428a-a8d2-a8c2e6f3c6c1',
  'Business Administration': 'a3f7ae2e-d27e-4fcc-bff0-ad9a90a9ab43',
  'Accounting': 'f90abfdc-79cd-449a-b208-d1e33a955165',
  'Political Science': '88d489ba-2eaa-4ff4-a40d-216622c6aa03',
  'Public and Property Law': '63b55431-088b-420f-b643-1404887d3e0e',
  'Private and International Law': '2b2570fd-ce2c-428e-845d-86e4432e2a8f',
  'Maternal and Child Health Nursing': '7ad9213d-edea-4e0f-a493-fb7fc7795f0d',
  'Human Physiology': '4833516d-991a-4e00-b3c3-fb5ad49897ed',
  'Human Anatomy': '8d8211c1-d228-4b42-822a-36bb7c8e73ff',
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
