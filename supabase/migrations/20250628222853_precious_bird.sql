/*
  # Sample Data Migration

  1. New Tables
    - `news` - University news and announcements
    - `academic_calendar` - Academic events and calendar

  2. Sample Data
    - Courses for different departments
    - News articles and announcements
    - Academic calendar events

  3. Security
    - Enable RLS on new tables
    - Add policies for news and academic calendar access
*/

-- Insert sample courses for each department with conflict handling
INSERT INTO courses (course_code, course_name, department_id, level, semester, credit_units, description) VALUES
-- Computer Science courses
('CSC101', 'Introduction to Computer Science', (SELECT id FROM departments WHERE name = 'Computer Science'), 100, 1, 3, 'Basic concepts of computer science'),
('CSC102', 'Programming Fundamentals', (SELECT id FROM departments WHERE name = 'Computer Science'), 100, 2, 3, 'Introduction to programming'),
('CSC201', 'Data Structures', (SELECT id FROM departments WHERE name = 'Computer Science'), 200, 1, 3, 'Data structures and algorithms'),
('CSC202', 'Object Oriented Programming', (SELECT id FROM departments WHERE name = 'Computer Science'), 200, 2, 3, 'OOP concepts and implementation'),
('CSC301', 'Database Systems', (SELECT id FROM departments WHERE name = 'Computer Science'), 300, 1, 3, 'Database design and management'),
('CSC302', 'Software Engineering', (SELECT id FROM departments WHERE name = 'Computer Science'), 300, 2, 3, 'Software development methodologies'),
('CSC401', 'Machine Learning', (SELECT id FROM departments WHERE name = 'Computer Science'), 400, 1, 3, 'Introduction to machine learning'),
('CSC402', 'Final Year Project', (SELECT id FROM departments WHERE name = 'Computer Science'), 400, 2, 6, 'Capstone project'),

-- Architecture courses
('ARC101', 'Architectural Design I', (SELECT id FROM departments WHERE name = 'Architecture'), 100, 1, 4, 'Basic architectural design principles'),
('ARC102', 'Building Construction', (SELECT id FROM departments WHERE name = 'Architecture'), 100, 2, 3, 'Construction methods and materials'),
('ARC201', 'Architectural Design II', (SELECT id FROM departments WHERE name = 'Architecture'), 200, 1, 4, 'Intermediate design concepts'),
('ARC202', 'Structural Systems', (SELECT id FROM departments WHERE name = 'Architecture'), 200, 2, 3, 'Structural engineering for architects'),
('ARC301', 'Urban Planning', (SELECT id FROM departments WHERE name = 'Architecture'), 300, 1, 3, 'City planning and development'),
('ARC302', 'Sustainable Design', (SELECT id FROM departments WHERE name = 'Architecture'), 300, 2, 3, 'Environmental design principles'),
('ARC401', 'Professional Practice', (SELECT id FROM departments WHERE name = 'Architecture'), 400, 1, 3, 'Architectural practice and ethics'),
('ARC402', 'Thesis Project', (SELECT id FROM departments WHERE name = 'Architecture'), 400, 2, 6, 'Final thesis project'),

-- Business Administration courses
('BUS101', 'Introduction to Business', (SELECT id FROM departments WHERE name = 'Business Administration'), 100, 1, 3, 'Basic business concepts'),
('BUS102', 'Business Mathematics', (SELECT id FROM departments WHERE name = 'Business Administration'), 100, 2, 3, 'Mathematical applications in business'),
('BUS201', 'Marketing Principles', (SELECT id FROM departments WHERE name = 'Business Administration'), 200, 1, 3, 'Marketing fundamentals'),
('BUS202', 'Operations Management', (SELECT id FROM departments WHERE name = 'Business Administration'), 200, 2, 3, 'Business operations and processes'),
('BUS301', 'Strategic Management', (SELECT id FROM departments WHERE name = 'Business Administration'), 300, 1, 3, 'Strategic planning and implementation'),
('BUS302', 'International Business', (SELECT id FROM departments WHERE name = 'Business Administration'), 300, 2, 3, 'Global business practices'),
('BUS401', 'Business Ethics', (SELECT id FROM departments WHERE name = 'Business Administration'), 400, 1, 3, 'Ethical considerations in business'),
('BUS402', 'Capstone Project', (SELECT id FROM departments WHERE name = 'Business Administration'), 400, 2, 6, 'Final business project'),

-- Biochemistry courses
('BIO101', 'General Biology', (SELECT id FROM departments WHERE name = 'Biochemistry'), 100, 1, 3, 'Introduction to biological sciences'),
('BIO102', 'Cell Biology', (SELECT id FROM departments WHERE name = 'Biochemistry'), 100, 2, 3, 'Structure and function of cells'),
('BIO201', 'Organic Chemistry', (SELECT id FROM departments WHERE name = 'Biochemistry'), 200, 1, 3, 'Organic chemistry principles'),
('BIO202', 'Biochemistry I', (SELECT id FROM departments WHERE name = 'Biochemistry'), 200, 2, 3, 'Basic biochemical processes'),
('BIO301', 'Molecular Biology', (SELECT id FROM departments WHERE name = 'Biochemistry'), 300, 1, 3, 'Molecular mechanisms of life'),
('BIO302', 'Biochemistry II', (SELECT id FROM departments WHERE name = 'Biochemistry'), 300, 2, 3, 'Advanced biochemical concepts'),
('BIO401', 'Research Methods', (SELECT id FROM departments WHERE name = 'Biochemistry'), 400, 1, 3, 'Scientific research methodology'),
('BIO402', 'Final Year Research', (SELECT id FROM departments WHERE name = 'Biochemistry'), 400, 2, 6, 'Independent research project')
ON CONFLICT (course_code) 
DO UPDATE SET
  course_name = EXCLUDED.course_name,
  department_id = EXCLUDED.department_id,
  level = EXCLUDED.level,
  semester = EXCLUDED.semester,
  credit_units = EXCLUDED.credit_units,
  description = EXCLUDED.description;

-- Create news/announcements table if not exists
CREATE TABLE IF NOT EXISTS news (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL CHECK (category IN ('academic', 'event', 'announcement')),
    author_name text DEFAULT 'University Administration',
    featured boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    media_url text
);

-- Insert sample news with conflict handling
INSERT INTO news (title, content, category, featured) VALUES
('First Semester 2024/2025 Registration Now Open', 'Students can now register for First Semester 2024/2025 courses through the online portal. Registration deadline is September 15th, 2024.', 'academic', true),
('Annual Research Symposium 2024', 'Join us for the Annual Research Symposium featuring presentations from our top students and faculty members.', 'event', true),
('New Laboratory Equipment Installed in COPAS', 'The College of Pure and Applied Sciences has received new state-of-the-art laboratory equipment.', 'announcement', false),
('Student Union Election Results Announced', 'The results of the 2024/2025 Student Union elections have been announced. Congratulations to all elected officials.', 'announcement', true),
('Career Fair 2024 - Industry Partners Welcome', 'Our annual career fair will feature over 50 companies from various industries.', 'event', false),
('Mid-Semester Break Schedule', 'Mid-semester break will commence on November 15th and classes will resume on November 22nd.', 'academic', false),
('New Scholarship Opportunities Available', 'Several scholarship opportunities are now available for outstanding students. Applications are open until December 1st, 2024.', 'announcement', true),
('Library Extended Hours During Exams', 'The university library will extend its operating hours during the examination period.', 'academic', false),
('Faculty Research Grant Recipients Announced', 'Congratulations to the faculty members who have been awarded research grants for the 2024/2025 academic year.', 'announcement', false),
('International Exchange Program Applications Open', 'Students interested in studying abroad can now apply for the international exchange program.', 'academic', true)
ON CONFLICT (title) DO NOTHING;

-- Create academic calendar table if not exists
CREATE TABLE IF NOT EXISTS academic_calendar (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_title text NOT NULL,
    event_date date NOT NULL,
    event_type text NOT NULL CHECK (event_type IN ('academic', 'break', 'exam')),
    description text,
    created_at timestamptz DEFAULT now()
);

-- Insert academic calendar events with conflict handling
INSERT INTO academic_calendar (event_title, event_date, event_type, description) VALUES
('Registration Deadline', '2024-09-15', 'academic', 'Last day for course registration'),
('First Semester Begins', '2024-09-22', 'academic', 'Start of first semester classes'),
('Mid-Semester Break Starts', '2024-11-15', 'break', 'Beginning of mid-semester break'),
('Mid-Semester Break Ends', '2024-11-22', 'break', 'End of mid-semester break'),
('Christmas Break Starts', '2024-12-20', 'break', 'Beginning of Christmas break'),
('Classes Resume', '2025-01-08', 'academic', 'Resumption of classes after break'),
('First Semester Ends', '2025-01-15', 'academic', 'End of first semester'),
('Second Semester Begins', '2025-02-01', 'academic', 'Start of second semester'),
('Second Semester Registration', '2025-01-20', 'academic', 'Registration for second semester'),
('Mid-Semester Exams', '2025-03-15', 'exam', 'Mid-semester examination period'),
('Easter Break Starts', '2025-04-10', 'break', 'Beginning of Easter break'),
('Easter Break Ends', '2025-04-20', 'break', 'End of Easter break'),
('Final Exams Begin', '2025-05-15', 'exam', 'Start of final examination period'),
('Second Semester Ends', '2025-06-15', 'academic', 'End of second semester'),
('Graduation Ceremony', '2025-07-10', 'academic', 'Annual graduation ceremony')
ON CONFLICT (event_title, event_date) DO NOTHING;

-- Create sample enrollments table for demonstration
CREATE TABLE IF NOT EXISTS sample_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name text NOT NULL,
    course_code text NOT NULL,
    academic_session text DEFAULT '2024/2025',
    semester integer DEFAULT 1,
    enrollment_date timestamptz DEFAULT now()
);

-- Insert sample enrollment data
INSERT INTO sample_enrollments (student_name, course_code) VALUES
('Adebayo Johnson', 'CSC101'),
('Adebayo Johnson', 'CSC102'),
('Chioma Okwu', 'BIO101'),
('Chioma Okwu', 'BIO102'),
('Kemi Adebayo', 'ARC101'),
('Kemi Adebayo', 'ARC102'),
('Tunde Olatunji', 'BUS101'),
('Tunde Olatunji', 'BUS102'),
('Ngozi Eze', 'CSC201'),
('Ngozi Eze', 'CSC202'),
('Emeka Nwosu', 'BIO201'),
('Emeka Nwosu', 'BIO202'),
('Funmi Adeyemi', 'ARC201'),
('Funmi Adeyemi', 'ARC202'),
('Segun Oladele', 'BUS201'),
('Segun Oladele', 'BUS202'),
('Blessing Okafor', 'CSC301'),
('Blessing Okafor', 'CSC302'),
('Chidi Okonkwo', 'BIO301'),
('Chidi Okonkwo', 'BIO302')
ON CONFLICT (student_name, course_code) DO NOTHING;

-- Create sample results table for demonstration
CREATE TABLE IF NOT EXISTS sample_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name text NOT NULL,
    course_code text NOT NULL,
    academic_session text DEFAULT '2024/2025',
    semester integer DEFAULT 1,
    score numeric(5,2),
    grade text,
    submitted_at timestamptz DEFAULT now()
);

-- Insert sample results data
INSERT INTO sample_results (student_name, course_code, score, grade) VALUES
('Adebayo Johnson', 'CSC101', 85.50, 'A'),
('Adebayo Johnson', 'CSC102', 78.25, 'B+'),
('Chioma Okwu', 'BIO101', 92.00, 'A+'),
('Chioma Okwu', 'BIO102', 88.75, 'A'),
('Kemi Adebayo', 'ARC101', 81.50, 'B+'),
('Kemi Adebayo', 'ARC102', 79.25, 'B'),
('Tunde Olatunji', 'BUS101', 87.00, 'A'),
('Tunde Olatunji', 'BUS102', 83.50, 'B+'),
('Ngozi Eze', 'CSC201', 90.25, 'A+'),
('Ngozi Eze', 'CSC202', 86.75, 'A'),
('Emeka Nwosu', 'BIO201', 84.00, 'B+'),
('Emeka Nwosu', 'BIO202', 89.50, 'A'),
('Funmi Adeyemi', 'ARC201', 82.75, 'B+'),
('Funmi Adeyemi', 'ARC202', 80.00, 'B+'),
('Segun Oladele', 'BUS201', 88.25, 'A'),
('Segun Oladele', 'BUS202', 85.75, 'A'),
('Blessing Okafor', 'CSC301', 91.50, 'A+'),
('Blessing Okafor', 'CSC302', 87.25, 'A'),
('Chidi Okonkwo', 'BIO301', 89.00, 'A'),
('Chidi Okonkwo', 'BIO302', 86.50, 'A')
ON CONFLICT (student_name, course_code) DO NOTHING;

-- Enable RLS for new tables
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;

-- News policies
CREATE POLICY "Anyone can read news"
    ON news
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage news"
    ON news
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Academic calendar policies
CREATE POLICY "Anyone can read academic calendar"
    ON academic_calendar
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage academic calendar"
    ON academic_calendar
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update trigger to news table
CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON news
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();