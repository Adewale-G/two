/*
  # Sample Data Migration for University System

  1. New Tables
    - `news` - University news and announcements
    - `academic_calendar` - Academic events and important dates
    - `sample_enrollments` - Sample enrollment data for demonstration
    - `sample_results` - Sample results data for demonstration

  2. Sample Data
    - Course data for Computer Science, Architecture, Business Administration, and Biochemistry
    - News articles and announcements
    - Academic calendar events
    - Sample student enrollments and results

  3. Security
    - Enable RLS on news and academic_calendar tables
    - Add policies for reading and managing content
    - Create update trigger for news table
*/

-- Insert sample courses for each department
INSERT INTO courses (course_code, course_name, department_id, level, semester, credit_units, description)
SELECT * FROM (VALUES
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
) AS new_courses(course_code, course_name, department_id, level, semester, credit_units, description)
WHERE NOT EXISTS (
    SELECT 1 FROM courses WHERE courses.course_code = new_courses.course_code
);

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

-- Insert sample news
INSERT INTO news (title, content, category, featured)
SELECT * FROM (VALUES
('First Semester 2024/2025 Registration Now Open', 'Students can now register for First Semester 2024/2025 courses through the online portal. Registration deadline is September 15th, 2024.', 'academic', true),
('Annual Research Symposium 2024', 'Join us for the Annual Research Symposium featuring presentations from our top students and faculty members.', 'event', true),
('New Laboratory Equipment Installed in COPAS', 'The College of Pure and Applied Sciences has received new state-of-the-art laboratory equipment.', 'announcement', false),
('Student Union Election Results Announced', 'The results of the 2024/2025 Student Union elections have been announced. Congratulations to all elected officials.', 'announcement', true),
('Career Fair 2024 - Industry Partners Welcome', 'Our annual career fair will feature over 50 companies from various industries.', 'event', false),
('Mid-Semester Break Schedule', 'Mid-semester break will commence on November 15th and classes will resume on November 22nd.', 'academic', false),
('New Scholarship Opportunities Available', 'Several scholarship opportunities are now available for outstanding students. Applications are open until December 1st, 2024.', 'announcement', true),
('Library Extended Hours During Exams', 'The university library will extend its operating hours during the examination period.', 'academic', false),
('Faculty Research Grant Recipients Announced', 'Congratulations to the faculty members who have been awarded research grants for the 2024/2025 academic year.', 'announcement', false),
('International Exchange Program Applications Open', 'Students interested in studying abroad can now apply for the international exchange program.', 'academic', true),
('Campus Security Update', 'New security measures have been implemented across campus to ensure the safety of all students and staff.', 'announcement', false),
('Sports Day 2024', 'The annual sports day will be held on October 10th. All students are encouraged to participate.', 'event', false),
('New Online Learning Resources Available', 'The university has subscribed to additional online learning platforms to support student learning.', 'academic', false),
('Campus Maintenance Schedule', 'Maintenance work will be carried out in various buildings during the weekend. Please plan accordingly.', 'announcement', false),
('Guest Lecture Series: Industry Experts', 'A series of guest lectures by industry experts will be held throughout the semester.', 'event', true),
('Student Counseling Services', 'Reminder about the availability of free counseling services for all students.', 'announcement', false),
('Faculty Development Workshop', 'A workshop on innovative teaching methods will be held for all faculty members.', 'event', false),
('Campus Wi-Fi Upgrade', 'The campus Wi-Fi infrastructure is being upgraded to provide better connectivity.', 'announcement', false),
('Student Achievement Awards', 'Nominations are now open for the annual student achievement awards.', 'event', true),
('New Course Offerings for Next Semester', 'Several new courses will be offered in the upcoming semester. Check the course catalog for details.', 'academic', false)
) AS new_news(title, content, category, featured)
WHERE NOT EXISTS (
    SELECT 1 FROM news WHERE news.title = new_news.title
);

-- Create academic calendar table if not exists
CREATE TABLE IF NOT EXISTS academic_calendar (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_title text NOT NULL,
    event_date date NOT NULL,
    event_type text NOT NULL CHECK (event_type IN ('academic', 'break', 'exam')),
    description text,
    created_at timestamptz DEFAULT now()
);

-- Insert academic calendar events
INSERT INTO academic_calendar (event_title, event_date, event_type, description)
SELECT * FROM (VALUES
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
) AS new_events(event_title, event_date, event_type, description)
WHERE NOT EXISTS (
    SELECT 1 FROM academic_calendar 
    WHERE academic_calendar.event_title = new_events.event_title 
    AND academic_calendar.event_date = new_events.event_date
);

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
INSERT INTO sample_enrollments (student_name, course_code)
SELECT * FROM (VALUES
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
('Chidi Okonkwo', 'BIO302'),
('Aisha Mohammed', 'CSC101'),
('Aisha Mohammed', 'CSC102'),
('Babatunde Lawal', 'ARC101'),
('Babatunde Lawal', 'ARC102'),
('Folake Dada', 'BUS101'),
('Folake Dada', 'BUS102'),
('Ibrahim Hassan', 'BIO101'),
('Ibrahim Hassan', 'BIO102'),
('Grace Onyeka', 'CSC201'),
('Grace Onyeka', 'CSC202'),
('David Okoro', 'ARC201'),
('David Okoro', 'ARC202'),
('Patience Udoh', 'BUS201'),
('Patience Udoh', 'BUS202'),
('Samuel Igwe', 'BIO201'),
('Samuel Igwe', 'BIO202'),
('Mary Nnamdi', 'CSC301'),
('Mary Nnamdi', 'CSC302'),
('Victor Eze', 'ARC301'),
('Victor Eze', 'ARC302'),
('Zainab Bello', 'BUS301'),
('Zainab Bello', 'BUS302'),
('Peter Obi', 'BIO301'),
('Peter Obi', 'BIO302'),
('Ruth Adamu', 'CSC401'),
('Ruth Adamu', 'CSC402'),
('James Okeke', 'ARC401'),
('James Okeke', 'ARC402'),
('Esther Musa', 'BUS401'),
('Esther Musa', 'BUS402')
) AS new_enrollments(student_name, course_code)
WHERE NOT EXISTS (
    SELECT 1 FROM sample_enrollments 
    WHERE sample_enrollments.student_name = new_enrollments.student_name 
    AND sample_enrollments.course_code = new_enrollments.course_code
);

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
INSERT INTO sample_results (student_name, course_code, score, grade)
SELECT * FROM (VALUES
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
('Chidi Okonkwo', 'BIO302', 86.50, 'A'),
('Aisha Mohammed', 'CSC101', 79.75, 'B'),
('Aisha Mohammed', 'CSC102', 82.50, 'B+'),
('Babatunde Lawal', 'ARC101', 88.25, 'A'),
('Babatunde Lawal', 'ARC102', 85.00, 'A'),
('Folake Dada', 'BUS101', 90.50, 'A+'),
('Folake Dada', 'BUS102', 87.75, 'A'),
('Ibrahim Hassan', 'BIO101', 83.25, 'B+'),
('Ibrahim Hassan', 'BIO102', 86.00, 'A'),
('Grace Onyeka', 'CSC201', 92.75, 'A+'),
('Grace Onyeka', 'CSC202', 89.50, 'A'),
('David Okoro', 'ARC201', 84.50, 'B+'),
('David Okoro', 'ARC202', 81.25, 'B+'),
('Patience Udoh', 'BUS201', 86.75, 'A'),
('Patience Udoh', 'BUS202', 88.00, 'A'),
('Samuel Igwe', 'BIO201', 91.25, 'A+'),
('Samuel Igwe', 'BIO202', 87.50, 'A'),
('Mary Nnamdi', 'CSC301', 89.75, 'A'),
('Mary Nnamdi', 'CSC302', 85.25, 'A'),
('Victor Eze', 'ARC301', 87.00, 'A'),
('Victor Eze', 'ARC302', 83.75, 'B+'),
('Zainab Bello', 'BUS301', 90.25, 'A+'),
('Zainab Bello', 'BUS302', 88.50, 'A'),
('Peter Obi', 'BIO301', 86.75, 'A'),
('Peter Obi', 'BIO302', 89.25, 'A'),
('Ruth Adamu', 'CSC401', 93.50, 'A+'),
('Ruth Adamu', 'CSC402', 91.00, 'A+'),
('James Okeke', 'ARC401', 88.75, 'A'),
('James Okeke', 'ARC402', 90.50, 'A+'),
('Esther Musa', 'BUS401', 92.25, 'A+'),
('Esther Musa', 'BUS402', 89.75, 'A')
) AS new_results(student_name, course_code, score, grade)
WHERE NOT EXISTS (
    SELECT 1 FROM sample_results 
    WHERE sample_results.student_name = new_results.student_name 
    AND sample_results.course_code = new_results.course_code
);

-- Enable RLS for new tables
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
    -- News policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'news' AND policyname = 'Anyone can read news'
    ) THEN
        CREATE POLICY "Anyone can read news"
            ON news
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'news' AND policyname = 'Admins can manage news'
    ) THEN
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
    END IF;

    -- Academic calendar policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_calendar' AND policyname = 'Anyone can read academic calendar'
    ) THEN
        CREATE POLICY "Anyone can read academic calendar"
            ON academic_calendar
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_calendar' AND policyname = 'Admins can manage academic calendar'
    ) THEN
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
    END IF;
END $$;

-- Create trigger function for updating timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update trigger to news table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_news_updated_at'
    ) THEN
        CREATE TRIGGER update_news_updated_at
            BEFORE UPDATE ON news
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;