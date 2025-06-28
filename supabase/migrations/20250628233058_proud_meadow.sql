/*
  # Add Demo User Profiles to Database

  1. New Profiles
    - Admin User (550e8400-e29b-41d4-a716-446655440001)
    - Dr. Sarah Wilson - Lecturer (550e8400-e29b-41d4-a716-446655440002)  
    - John Student (550e8400-e29b-41d4-a716-446655440003)

  2. Features
    - Valid UUIDs for all demo users
    - Complete profile information
    - Proper faculty and department associations
    - Avatar URLs from Pexels
    - Realistic bio and contact information

  3. Security
    - No RLS policy changes needed
    - Uses existing profile structure
*/

-- First, let's ensure we have the required faculties and departments
-- Insert faculties if they don't exist
INSERT INTO faculties (id, name, full_name, description, dean_name, dean_email, dean_phone) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'COPAS', 'College of Pure and Applied Sciences', 'Welcome to Caleb University''s College of Pure and Applied Sciences, a thriving academic community dedicated to nurturing scientific curiosity, fostering innovation, and advancing knowledge in the realms of pure and applied sciences.', 'Prof. Kehinde Ogunniran', 'kehinde.ogunniran@calebuniversity.edu.ng', '07039772668'),
('550e8400-e29b-41d4-a716-446655440011', 'ADMINISTRATION', 'University Administration', 'Central administration managing university operations and academic affairs.', 'Prof. Vice Chancellor', 'vc@calebuniversity.edu.ng', '08012345678')
ON CONFLICT (id) DO NOTHING;

-- Insert departments if they don't exist
INSERT INTO departments (id, name, faculty_id, head_of_department) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Computer Science', '550e8400-e29b-41d4-a716-446655440010', 'Dr. Sarah Wilson'),
('550e8400-e29b-41d4-a716-446655440021', 'Administration', '550e8400-e29b-41d4-a716-446655440011', 'Admin Head')
ON CONFLICT (id) DO NOTHING;

-- Insert demo user profiles
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
-- Admin User
(
  '550e8400-e29b-41d4-a716-446655440001',
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
-- Lecturer User
(
  '550e8400-e29b-41d4-a716-446655440002',
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
-- Student User
(
  '550e8400-e29b-41d4-a716-446655440003',
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
  emergency_contact = EXCLUDED.emergency_contact,
  updated_at = now();

-- Verify the profiles were inserted correctly
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count 
    FROM profiles 
    WHERE id IN (
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002', 
        '550e8400-e29b-41d4-a716-446655440003'
    );
    
    IF profile_count = 3 THEN
        RAISE NOTICE 'Successfully added/updated % demo user profiles', profile_count;
    ELSE
        RAISE WARNING 'Expected 3 demo profiles, but found %', profile_count;
    END IF;
END $$;