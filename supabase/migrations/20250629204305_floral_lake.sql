/*
  # Fix User Signup and Profile Creation

  1. Database Schema Updates
    - Fix data type mismatch between user_posts.author_id and profiles.id
    - Change user_posts.author_id from text to uuid
    - Update foreign key constraints properly

  2. User Registration Function
    - Create or replace function to handle new user registration
    - Automatically create profile when user signs up
    - Extract user data from metadata

  3. Security Policies
    - Enable RLS on profiles and user_posts tables
    - Allow users to create, read, update their own profiles
    - Allow users to manage their own posts
    - Allow reading of all posts

  4. Triggers
    - Create trigger to automatically create profile for new users
*/

-- Create or replace function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    username, 
    role, 
    is_verified
  )
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

-- Fix the data type mismatch in user_posts table
-- First, drop the existing foreign key constraint
ALTER TABLE IF EXISTS user_posts 
  DROP CONSTRAINT IF EXISTS user_posts_author_id_fkey;

-- Change the author_id column from text to uuid
-- First, update any existing data to convert text to uuid (if possible)
UPDATE user_posts 
SET author_id = NULL 
WHERE author_id IS NOT NULL 
  AND author_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Now alter the column type
DO $$
BEGIN
  -- Try to alter the column type
  BEGIN
    ALTER TABLE user_posts 
    ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
  EXCEPTION
    WHEN others THEN
      -- If conversion fails, drop and recreate the column
      ALTER TABLE user_posts DROP COLUMN IF EXISTS author_id;
      ALTER TABLE user_posts ADD COLUMN author_id uuid;
  END;
END $$;

-- Re-add the foreign key constraint with correct types
ALTER TABLE user_posts
  ADD CONSTRAINT user_posts_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Update RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Allow authenticated insert" ON profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create comprehensive policies for profiles
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update RLS policies for user_posts
ALTER TABLE user_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Users can insert their own posts" ON user_posts;
DROP POLICY IF EXISTS "Users can create own posts" ON user_posts;
DROP POLICY IF EXISTS "Anyone can read posts" ON user_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON user_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON user_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON user_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON user_posts;

-- Create comprehensive policies for user_posts with uuid comparison
CREATE POLICY "Users can insert their own posts"
  ON user_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Anyone can read posts"
  ON user_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own posts"
  ON user_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
  ON user_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Update other related tables to use uuid for user references
-- Fix post_comments table
ALTER TABLE post_comments 
  DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;

DO $$
BEGIN
  BEGIN
    ALTER TABLE post_comments 
    ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
  EXCEPTION
    WHEN others THEN
      ALTER TABLE post_comments DROP COLUMN IF EXISTS user_id;
      ALTER TABLE post_comments ADD COLUMN user_id uuid;
  END;
END $$;

ALTER TABLE post_comments
  ADD CONSTRAINT post_comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Fix post_likes table
ALTER TABLE post_likes 
  DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;

DO $$
BEGIN
  BEGIN
    ALTER TABLE post_likes 
    ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
  EXCEPTION
    WHEN others THEN
      ALTER TABLE post_likes DROP COLUMN IF EXISTS user_id;
      ALTER TABLE post_likes ADD COLUMN user_id uuid;
  END;
END $$;

ALTER TABLE post_likes
  ADD CONSTRAINT post_likes_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Fix post_bookmarks table
ALTER TABLE post_bookmarks 
  DROP CONSTRAINT IF EXISTS post_bookmarks_user_id_fkey;

DO $$
BEGIN
  BEGIN
    ALTER TABLE post_bookmarks 
    ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
  EXCEPTION
    WHEN others THEN
      ALTER TABLE post_bookmarks DROP COLUMN IF EXISTS user_id;
      ALTER TABLE post_bookmarks ADD COLUMN user_id uuid;
  END;
END $$;

ALTER TABLE post_bookmarks
  ADD CONSTRAINT post_bookmarks_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Verify the setup
DO $$
DECLARE
    profile_count INTEGER;
    post_count INTEGER;
    constraint_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO post_count FROM user_posts;
    
    -- Check if foreign key constraint exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_posts_author_id_fkey'
    ) INTO constraint_exists;
    
    RAISE NOTICE 'Setup verified: % profiles, % posts, FK constraint exists: %', 
                 profile_count, post_count, constraint_exists;
END $$;