import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://onwluqqlacifazsrdrsq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ud2x1cXFsYWNpZmF6c3JkcnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTM1NzEsImV4cCI6MjA2NTQ4OTU3MX0.3tUIAi0Ihfww6JmxrSB54MapbE7jTVz10IT_GMi0hS4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Add a simple function to test database connectivity
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    return { success: !error, error: error?.message };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// Function to manually insert demo profiles
export const insertDemoProfiles = async () => {
  try {
    // First, ensure faculties exist
    const { error: facultyError } = await supabase
      .from('faculties')
      .upsert([
        {
          id: '550e8400-e29b-41d4-a716-446655440010',
          name: 'COPAS',
          full_name: 'College of Pure and Applied Sciences',
          description: 'College of Pure and Applied Sciences',
          dean_name: 'Prof. Kehinde Ogunniran',
          dean_email: 'kehinde.ogunniran@calebuniversity.edu.ng',
          dean_phone: '07039772668'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440011',
          name: 'ADMINISTRATION',
          full_name: 'University Administration',
          description: 'University Administration',
          dean_name: 'Prof. Vice Chancellor',
          dean_email: 'vc@calebuniversity.edu.ng',
          dean_phone: '08012345678'
        }
      ]);

    if (facultyError) {
      console.error('Faculty insert error:', facultyError);
    }

    // Then, ensure departments exist
    const { error: deptError } = await supabase
      .from('departments')
      .upsert([
        {
          id: '550e8400-e29b-41d4-a716-446655440020',
          name: 'Computer Science',
          faculty_id: '550e8400-e29b-41d4-a716-446655440010',
          head_of_department: 'Dr. Sarah Wilson'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440021',
          name: 'Administration',
          faculty_id: '550e8400-e29b-41d4-a716-446655440011',
          head_of_department: 'Admin Head'
        }
      ]);

    if (deptError) {
      console.error('Department insert error:', deptError);
    }

    // Finally, insert demo profiles
    const { data, error } = await supabase
      .from('profiles')
      .upsert([
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'admin@pineappl.edu',
          full_name: 'Admin User',
          username: 'admin_user',
          role: 'admin',
          date_of_birth: '1985-05-15',
          phone: '+234 801 234 5678',
          address: 'Admin Block',
          faculty_id: '550e8400-e29b-41d4-a716-446655440011',
          department_id: '550e8400-e29b-41d4-a716-446655440021',
          staff_id: 'ADMIN001',
          bio: 'University administrator',
          avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          is_verified: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          email: 'lecturer@pineappl.edu',
          full_name: 'Dr. Sarah Wilson',
          username: 'sarah_wilson',
          role: 'lecturer',
          date_of_birth: '1980-08-22',
          phone: '+234 802 345 6789',
          address: 'Faculty Housing',
          faculty_id: '550e8400-e29b-41d4-a716-446655440010',
          department_id: '550e8400-e29b-41d4-a716-446655440020',
          staff_id: 'STAFF002',
          bio: 'Lecturer in Computer Science',
          avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
          is_verified: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          email: 'student@pineappl.edu',
          full_name: 'John Student',
          username: 'john_student',
          role: 'student',
          date_of_birth: '2000-03-10',
          phone: '+234 803 456 7890',
          address: 'Student Hostel',
          faculty_id: '550e8400-e29b-41d4-a716-446655440010',
          department_id: '550e8400-e29b-41d4-a716-446655440020',
          matric_number: 'STU2021001',
          bio: 'Computer Science student',
          avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
          is_verified: true
        }
      ]);

    return { success: !error, data, error: error?.message };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          username: string;
          role: 'admin' | 'lecturer' | 'student';
          date_of_birth: string | null;
          phone: string | null;
          address: string | null;
          faculty_id: string | null;
          department_id: string | null;
          matric_number: string | null;
          staff_id: string | null;
          bio: string | null;
          avatar_url: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
          interests: string[] | null;
          emergency_contact: any | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          username: string;
          role?: 'admin' | 'lecturer' | 'student';
          date_of_birth?: string | null;
          phone?: string | null;
          address?: string | null;
          faculty_id?: string | null;
          department_id?: string | null;
          matric_number?: string | null;
          staff_id?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          is_verified?: boolean;
          interests?: string[] | null;
          emergency_contact?: any | null;
        };
        Update: Partial<Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };

      faculties: {
        Row: {
          id: string;
          name: string;
          full_name: string;
          description: string | null;
          dean_name: string | null;
          dean_email: string | null;
          dean_phone: string | null;
          created_at: string;
        };
      };

      departments: {
        Row: {
          id: string;
          name: string;
          faculty_id: string;
          head_of_department: string | null;
          created_at: string;
        };
      };

      courses: {
        Row: {
          id: string;
          course_code: string;
          course_name: string;
          department_id: string;
          lecturer_id: string | null;
          credit_units: number;
          level: number;
          semester: number;
          description: string | null;
          created_at: string;
        };
      };

      user_posts: {
        Row: {
          id: string;
          content: string;
          media_url: string | null;
          type: 'text' | 'image' | 'video';
          created_at: string;
          updated_at: string;
          author_id: string;
          likes_count: number;
          comments_count: number;
          shares_count: number;
        };
        Insert: {
          author_id: string;
          content: string;
          type: 'text' | 'image' | 'video';
          media_url?: string | null;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
        };
        Update: Partial<Omit<Database['public']['Tables']['user_posts']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };

      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
      };

      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
      };

      post_bookmarks: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
      };

      user_media: {
        Row: {
          id: string;
          user_id: string;
          media_type: string;
          filename: string;
          media_url: string;
          created_at: string;
        };
      };
    };
  };
};