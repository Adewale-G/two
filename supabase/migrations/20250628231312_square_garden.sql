/*
  # Fix user_posts table and foreign key constraints

  1. Changes
    - Update user_posts table to use proper UUID foreign key for author_id
    - Fix foreign key constraint to reference profiles table
    - Update existing sample posts to use proper UUIDs
    - Ensure RLS policies work correctly

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control for posts
*/

-- First, let's update the user_posts table structure
ALTER TABLE user_posts ALTER COLUMN author_id TYPE uuid USING author_id::uuid;

-- Drop the existing foreign key constraint if it exists
ALTER TABLE user_posts DROP CONSTRAINT IF EXISTS user_posts_author_id_fkey;

-- Add the proper foreign key constraint
ALTER TABLE user_posts 
ADD CONSTRAINT user_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Clear existing sample posts and insert new ones with proper UUIDs
DELETE FROM user_posts;

-- Insert sample posts with proper UUID references
INSERT INTO user_posts (author_id, content, type) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Welcome to the new academic year! Excited to see all the amazing projects our students will work on this semester. 🎓', 'text'),
('550e8400-e29b-41d4-a716-446655440002', 'Just finished setting up the new AI lab! Can''t wait to start our machine learning course next week. The equipment is state-of-the-art! 🤖', 'text'),
('550e8400-e29b-41d4-a716-446655440003', 'First week of classes done! Already learning so much in my computer science courses. The professors here are amazing! 💻', 'text'),
('550e8400-e29b-41d4-a716-446655440001', 'Reminder: Registration for second semester courses opens next Monday. Make sure to check the course catalog and plan your schedule accordingly.', 'text'),
('550e8400-e29b-41d4-a716-446655440002', 'Proud of my students who presented their research at the symposium today. The future of technology is in good hands! 🔬', 'text'),
('550e8400-e29b-41d4-a716-446655440003', 'Study group for Database Systems meeting tomorrow at 3 PM in the library. All CS students welcome! 📚', 'text');

-- Update RLS policies to work with UUID author_id
DROP POLICY IF EXISTS "Users can create own posts" ON user_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON user_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON user_posts;

-- Recreate policies with proper UUID handling
CREATE POLICY "Users can create own posts" 
ON user_posts FOR INSERT 
TO authenticated 
WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own posts" 
ON user_posts FOR UPDATE 
TO authenticated 
USING (author_id = auth.uid());

CREATE POLICY "Users can delete own posts" 
ON user_posts FOR DELETE 
TO authenticated 
USING (author_id = auth.uid());

-- Update post_likes and post_comments foreign key constraints
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;
ALTER TABLE post_likes 
ADD CONSTRAINT post_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;
ALTER TABLE post_comments 
ADD CONSTRAINT post_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE post_bookmarks DROP CONSTRAINT IF EXISTS post_bookmarks_user_id_fkey;
ALTER TABLE post_bookmarks 
ADD CONSTRAINT post_bookmarks_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;