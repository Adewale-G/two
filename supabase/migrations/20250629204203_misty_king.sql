/*
  # Fix user signup and profile creation

  1. Updates
    - Improve the handle_new_user function to properly create profiles
    - Fix foreign key relationship between user_posts and profiles
    - Add RLS policies to allow new users to create profiles
  
  2. Security
    - Ensure proper RLS policies for profiles and posts
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

-- Fix the relationship between user_posts and profiles
ALTER TABLE IF EXISTS user_posts 
  DROP CONSTRAINT IF EXISTS user_posts_author_id_fkey;

-- Re-add the constraint with the correct reference
ALTER TABLE user_posts
  ADD CONSTRAINT user_posts_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Update RLS policies for profiles to allow new users to create their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Allow authenticated insert" ON profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their profile" ON profiles;

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update RLS policies for user_posts to ensure proper access
ALTER TABLE user_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Users can insert their own posts" ON user_posts;

-- Create policy to allow users to insert their own posts
CREATE POLICY "Users can insert their own posts"
  ON user_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = author_id);

-- Create policy to allow users to read all posts
CREATE POLICY "Anyone can read posts"
  ON user_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow users to update their own posts
CREATE POLICY "Users can update their own posts"
  ON user_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = author_id)
  WITH CHECK (auth.uid()::text = author_id);

-- Create policy to allow users to delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON user_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = author_id);

-- Verify the setup
DO $$
DECLARE
    profile_count INTEGER;
    post_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO post_count FROM user_posts;
    
    RAISE NOTICE 'Setup verified: % profiles, % posts', profile_count, post_count;
END $$;