/*
  # Fix database issues and add demo data

  1. New Functions
    - Create handle_new_user function for automatic profile creation
    - Add trigger for auth.users to create profiles automatically
  
  2. Data Setup
    - Add all faculties and departments
    - Create demo users with complete profiles
    - Add sample posts and news items
    
  3. Relationships
    - Ensure proper foreign key relationships between tables
*/

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, role, is_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'student')::user_role,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure faculties exist first
INSERT INTO faculties (id, name, full_name, description, dean_name, dean_email, dean_phone) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'COPAS', 'College of Pure and Applied Sciences', 'Welcome to Caleb University''s College of Pure and Applied Sciences, a thriving academic community dedicated to nurturing scientific curiosity, fostering innovation, and advancing knowledge in the realms of pure and applied sciences.', 'Prof. Kehinde Ogunniran', 'kehinde.ogunniran@calebuniversity.edu.ng', '07039772668'),
('550e8400-e29b-41d4-a716-446655440011', 'ADMINISTRATION', 'University Administration', 'Central administration managing university operations and academic affairs.', 'Prof. Vice Chancellor', 'vc@calebuniversity.edu.ng', '08012345678'),
('550e8400-e29b-41d4-a716-446655440012', 'COLENSMA', 'College of Environmental Sciences and Management', 'Welcome to Caleb University''s College of Environmental Sciences and Management, a hub of innovation, sustainability, and excellence in the fields of architecture, estate management, and quantity surveying.', 'Prof. Adebayo Ogundimu', 'adebayo.ogundimu@calebuniversity.edu.ng', '08012345678'),
('550e8400-e29b-41d4-a716-446655440013', 'CASMAS', 'College of Art, Social, and Management Science', 'Welcome to Caleb University''s College of Art, Social, and Management Science, a dynamic and interdisciplinary academic community dedicated to fostering creativity, critical thinking, and professional excellence.', 'Prof. Funmi Adeyemi', 'funmi.adeyemi@calebuniversity.edu.ng', '08023456789'),
('550e8400-e29b-41d4-a716-446655440014', 'COLAW', 'College of Law', 'Welcome to Caleb University College of Law, a vibrant and aspiring institution committed to nurturing the next generation of legal professionals.', 'Prof. Foluke Dada', 'foluke.dada@calebuniversity.edu.ng', '08034567890'),
('550e8400-e29b-41d4-a716-446655440015', 'NURSING', 'College of Nursing and Basic Medical Sciences', 'Caleb University College of Nursing and Basic Medical Sciences stands as a beacon of excellence in healthcare education.', 'Prof. Blessing Okafor', 'blessing.okafor@calebuniversity.edu.ng', '08045678901')
ON CONFLICT (id) DO NOTHING;

-- Ensure departments exist
INSERT INTO departments (id, name, faculty_id, head_of_department) VALUES
-- COPAS Departments
('550e8400-e29b-41d4-a716-446655440020', 'Computer Science', '550e8400-e29b-41d4-a716-446655440010', 'Dr. Sarah Wilson'),
('550e8400-e29b-41d4-a716-446655440021', 'Administration', '550e8400-e29b-41d4-a716-446655440011', 'Admin Head'),
('550e8400-e29b-41d4-a716-446655440022', 'Biochemistry', '550e8400-e29b-41d4-a716-446655440010', 'Dr. Emily Chen'),
('550e8400-e29b-41d4-a716-446655440023', 'Cyber Security', '550e8400-e29b-41d4-a716-446655440010', 'Dr. John Smith'),
('550e8400-e29b-41d4-a716-446655440024', 'Software Engineering', '550e8400-e29b-41d4-a716-446655440010', 'Prof. Jane Williams'),
('550e8400-e29b-41d4-a716-446655440025', 'Information Systems', '550e8400-e29b-41d4-a716-446655440010', 'Dr. David Brown'),
('550e8400-e29b-41d4-a716-446655440026', 'Environmental Management and Toxicology', '550e8400-e29b-41d4-a716-446655440010', 'Dr. Lisa Garcia'),
('550e8400-e29b-41d4-a716-446655440027', 'Industrial Chemistry', '550e8400-e29b-41d4-a716-446655440010', 'Prof. Robert Miller'),
('550e8400-e29b-41d4-a716-446655440028', 'Microbiology and Industrial Biotechnology', '550e8400-e29b-41d4-a716-446655440010', 'Dr. Maria Davis'),

-- COLENSMA Departments
('550e8400-e29b-41d4-a716-446655440029', 'Architecture', '550e8400-e29b-41d4-a716-446655440012', 'Prof. Michael Brown'),
('550e8400-e29b-41d4-a716-446655440030', 'Estate Management', '550e8400-e29b-41d4-a716-446655440012', 'Dr. William Rodriguez'),

-- CASMAS Departments
('550e8400-e29b-41d4-a716-446655440031', 'Business Administration', '550e8400-e29b-41d4-a716-446655440013', 'Prof. Thomas Thomas'),
('550e8400-e29b-41d4-a716-446655440032', 'Accounting', '550e8400-e29b-41d4-a716-446655440013', 'Dr. Jessica Taylor'),
('550e8400-e29b-41d4-a716-446655440033', 'Economics', '550e8400-e29b-41d4-a716-446655440013', 'Dr. Christopher Moore'),
('550e8400-e29b-41d4-a716-446655440034', 'Mass Communication', '550e8400-e29b-41d4-a716-446655440013', 'Dr. Daniel Martin'),
('550e8400-e29b-41d4-a716-446655440035', 'Psychology', '550e8400-e29b-41d4-a716-446655440013', 'Prof. Karen Jackson'),
('550e8400-e29b-41d4-a716-446655440036', 'Banking and Finance', '550e8400-e29b-41d4-a716-446655440013', 'Dr. Nancy Lee'),
('550e8400-e29b-41d4-a716-446655440037', 'Criminology and Security Studies', '550e8400-e29b-41d4-a716-446655440013', 'Prof. Mark Thompson'),
('550e8400-e29b-41d4-a716-446655440038', 'International Relations', '550e8400-e29b-41d4-a716-446655440013', 'Dr. Betty White'),
('550e8400-e29b-41d4-a716-446655440039', 'Peace Studies and Conflict Resolution', '550e8400-e29b-41d4-a716-446655440013', 'Dr. Donald Harris'),
('550e8400-e29b-41d4-a716-446655440040', 'Political Science', '550e8400-e29b-41d4-a716-446655440013', 'Dr. Helen Sanchez'),
('550e8400-e29b-41d4-a716-446655440041', 'Public Administration', '550e8400-e29b-41d4-a716-446655440013', 'Prof. Helen Sanchez'),
('550e8400-e29b-41d4-a716-446655440042', 'Taxation', '550e8400-e29b-41d4-a716-446655440013', 'Dr. Steven Clark'),

-- COLAW Departments
('550e8400-e29b-41d4-a716-446655440043', 'Public and Property Law', '550e8400-e29b-41d4-a716-446655440014', 'Prof. Steven Clark'),
('550e8400-e29b-41d4-a716-446655440044', 'Private and International Law', '550e8400-e29b-41d4-a716-446655440014', 'Dr. Sandra Ramirez'),

-- NURSING Departments
('550e8400-e29b-41d4-a716-446655440045', 'Maternal and Child Health Nursing', '550e8400-e29b-41d4-a716-446655440015', 'Prof. Kenneth Allen'),
('550e8400-e29b-41d4-a716-446655440046', 'Community and Public Health Nursing', '550e8400-e29b-41d4-a716-446655440015', 'Dr. Sharon King'),
('550e8400-e29b-41d4-a716-446655440047', 'Adult Health/Medical and Surgical Nursing', '550e8400-e29b-41d4-a716-446655440015', 'Dr. Kevin Wright'),
('550e8400-e29b-41d4-a716-446655440048', 'Mental Health and Psychiatric Nursing', '550e8400-e29b-41d4-a716-446655440015', 'Prof. Betty Scott'),
('550e8400-e29b-41d4-a716-446655440049', 'Nursing Management and Education', '550e8400-e29b-41d4-a716-446655440015', 'Dr. Donald Green'),
('550e8400-e29b-41d4-a716-446655440050', 'Human Physiology', '550e8400-e29b-41d4-a716-446655440015', 'Prof. Helen Adams'),
('550e8400-e29b-41d4-a716-446655440051', 'Human Anatomy', '550e8400-e29b-41d4-a716-446655440015', 'Dr. Steven Baker')
ON CONFLICT (id) DO NOTHING;

-- Create demo auth users and profiles
DO $$
DECLARE
    admin_user_id uuid := '550e8400-e29b-41d4-a716-446655440001';
    lecturer_user_id uuid := '550e8400-e29b-41d4-a716-446655440002';
    student_user_id uuid := '550e8400-e29b-41d4-a716-446655440003';
BEGIN
    -- Insert into auth.users (this will trigger profile creation)
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES 
    (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@pineappl.edu',
        crypt('demo123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Admin User", "role": "admin"}',
        false,
        'authenticated'
    ),
    (
        lecturer_user_id,
        '00000000-0000-0000-0000-000000000000',
        'lecturer@pineappl.edu',
        crypt('demo123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Dr. Sarah Wilson", "role": "lecturer"}',
        false,
        'authenticated'
    ),
    (
        student_user_id,
        '00000000-0000-0000-0000-000000000000',
        'student@pineappl.edu',
        crypt('demo123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "John Student", "role": "student"}',
        false,
        'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Update profiles with complete information
    INSERT INTO profiles (
        id, 
        email, 
        full_name, 
        username, 
        role, 
        date_of_birth, 
        phone, 
        address, 
        faculty_id, 
        department_id, 
        matric_number, 
        staff_id, 
        bio, 
        avatar_url, 
        is_verified,
        interests,
        emergency_contact
    ) VALUES
    (
        admin_user_id,
        'admin@pineappl.edu',
        'Admin User',
        'admin_user',
        'admin',
        '1985-05-15',
        '+234 801 234 5678',
        'Admin Block, University Campus',
        '550e8400-e29b-41d4-a716-446655440011',
        '550e8400-e29b-41d4-a716-446655440021',
        NULL,
        'ADMIN001',
        'University administrator with over 10 years of experience in academic management and student affairs.',
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        true,
        ARRAY['Administration', 'Management', 'Education Policy', 'Student Affairs'],
        '{"name": "Emergency Contact", "relationship": "Colleague", "phone": "+234 801 111 1111"}'::jsonb
    ),
    (
        lecturer_user_id,
        'lecturer@pineappl.edu',
        'Dr. Sarah Wilson',
        'sarah_wilson',
        'lecturer',
        '1980-08-22',
        '+234 802 345 6789',
        'Faculty Housing Block B, Apt 12',
        '550e8400-e29b-41d4-a716-446655440010',
        '550e8400-e29b-41d4-a716-446655440020',
        NULL,
        'STAFF002',
        'Lecturer in Computer Science specializing in Artificial Intelligence and Machine Learning. PhD from University of Cambridge.',
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
        true,
        ARRAY['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Research'],
        '{"name": "Dr. Michael Wilson", "relationship": "Spouse", "phone": "+234 802 222 2222"}'::jsonb
    ),
    (
        student_user_id,
        'student@pineappl.edu',
        'John Student',
        'john_student',
        'student',
        '2000-03-10',
        '+234 803 456 7890',
        'Student Hostel Block A, Room 205',
        '550e8400-e29b-41d4-a716-446655440010',
        '550e8400-e29b-41d4-a716-446655440020',
        'STU2021001',
        NULL,
        'Computer Science student passionate about software development and technology innovation. Currently in 400 level.',
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        true,
        ARRAY['Programming', 'Web Development', 'Mobile Apps', 'Gaming'],
        '{"name": "Mary Student", "relationship": "Mother", "phone": "+234 803 333 3333"}'::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        username = EXCLUDED.username,
        role = EXCLUDED.role,
        date_of_birth = EXCLUDED.date_of_birth,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        faculty_id = EXCLUDED.faculty_id,
        department_id = EXCLUDED.department_id,
        matric_number = EXCLUDED.matric_number,
        staff_id = EXCLUDED.staff_id,
        bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url,
        is_verified = EXCLUDED.is_verified,
        interests = EXCLUDED.interests,
        emergency_contact = EXCLUDED.emergency_contact;
END $$;

-- Insert sample posts with proper author references
INSERT INTO user_posts (author_id, content, type, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Welcome to the new academic year! Excited to see all the amazing projects our students will work on this semester. 🎓', 'text', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440002', 'Just finished setting up the new AI lab! Can''t wait to start our machine learning course next week. The equipment is state-of-the-art! 🤖', 'text', now() - interval '1 day'),
('550e8400-e29b-41d4-a716-446655440003', 'First week of classes done! Already learning so much in my computer science courses. The professors here are amazing! 💻', 'text', now() - interval '12 hours'),
('550e8400-e29b-41d4-a716-446655440001', 'Reminder: Registration for second semester courses opens next Monday. Make sure to check the course catalog and plan your schedule accordingly.', 'text', now() - interval '6 hours'),
('550e8400-e29b-41d4-a716-446655440002', 'Proud of my students who presented their research at the symposium today. The future of technology is in good hands! 🔬', 'text', now() - interval '3 hours'),
('550e8400-e29b-41d4-a716-446655440003', 'Study group for Database Systems meeting tomorrow at 3 PM in the library. All CS students welcome! 📚', 'text', now() - interval '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Insert sample news
INSERT INTO news (title, content, category, author_name, featured, created_at) VALUES
('First Semester 2024/2025 Registration Now Open', 'Students can now register for First Semester 2024/2025 courses through the online portal. Registration deadline is September 15th, 2024.', 'academic', 'Academic Office', true, now() - interval '3 days'),
('Annual Research Symposium 2024', 'Join us for the Annual Research Symposium featuring presentations from our top students and faculty members.', 'event', 'Research Office', true, now() - interval '2 days'),
('New Laboratory Equipment Installed in COPAS', 'The College of Pure and Applied Sciences has received new state-of-the-art laboratory equipment.', 'announcement', 'COPAS Administration', false, now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for media if it doesn't exist
DO $$
BEGIN
    EXECUTE format('CREATE BUCKET IF NOT EXISTS media');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create bucket: %', SQLERRM;
END $$;

-- Verify the setup
DO $$
DECLARE
    profile_count INTEGER;
    post_count INTEGER;
    news_count INTEGER;
    faculty_count INTEGER;
    department_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO post_count FROM user_posts;
    SELECT COUNT(*) INTO news_count FROM news;
    SELECT COUNT(*) INTO faculty_count FROM faculties;
    SELECT COUNT(*) INTO department_count FROM departments;
    
    RAISE NOTICE 'Setup complete: % profiles, % posts, % news items, % faculties, % departments', 
        profile_count, post_count, news_count, faculty_count, department_count;
END $$;