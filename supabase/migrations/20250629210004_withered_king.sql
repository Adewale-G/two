/*
  # Fix UUID data type conversion and user registration

  1. New Functions
    - `handle_new_user()` - Automatically creates profile for new auth users
    - `is_text_column()` - Helper to check column data types safely

  2. Data Type Fixes
    - Convert text columns to uuid where needed in user_posts, post_comments, post_likes, post_bookmarks
    - Add proper foreign key constraints

  3. Security
    - Enable RLS on all tables
    - Add comprehensive policies for profiles and post-related tables
    - Set up automatic profile creation trigger
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

-- Function to safely check if a column is text type
CREATE OR REPLACE FUNCTION is_text_column(tbl_name text, col_name text)
RETURNS boolean AS $$
DECLARE
    col_type text;
BEGIN
    SELECT data_type INTO col_type
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = tbl_name 
    AND column_name = col_name;
    
    RETURN col_type IN ('text', 'character varying', 'varchar');
END;
$$ LANGUAGE plpgsql;

-- Fix user_posts table data type issues
-- First, drop ALL existing RLS policies that depend on author_id
DROP POLICY IF EXISTS "Users can create own posts" ON user_posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON user_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON user_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON user_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON user_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON user_posts;
DROP POLICY IF EXISTS "Anyone can read posts" ON user_posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON user_posts;

-- Drop existing foreign key constraint
ALTER TABLE IF EXISTS user_posts 
  DROP CONSTRAINT IF EXISTS user_posts_author_id_fkey;

-- Convert author_id column from text to uuid if needed
DO $$
DECLARE
    is_text_type boolean;
BEGIN
    -- Check if the column is text type
    SELECT is_text_column('user_posts', 'author_id') INTO is_text_type;
    
    IF is_text_type THEN
        RAISE NOTICE 'Converting author_id from text to uuid';
        
        -- Clean up any invalid data before type conversion
        UPDATE user_posts 
        SET author_id = NULL 
        WHERE author_id IS NOT NULL 
          AND author_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

        -- Try to alter the column type directly
        BEGIN
            ALTER TABLE user_posts 
            ALTER COLUMN author_id TYPE uuid USING 
              CASE 
                WHEN author_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN author_id::uuid 
                ELSE NULL 
              END;
            RAISE NOTICE 'Successfully converted author_id column to uuid';
        EXCEPTION
            WHEN others THEN
                -- If direct conversion fails, recreate the column
                RAISE NOTICE 'Direct conversion failed, recreating column: %', SQLERRM;
                
                -- Create a temporary column
                ALTER TABLE user_posts ADD COLUMN author_id_temp uuid;
                
                -- Copy valid uuid data
                UPDATE user_posts 
                SET author_id_temp = author_id::uuid 
                WHERE author_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
                
                -- Drop the old column and rename the new one
                ALTER TABLE user_posts DROP COLUMN author_id;
                ALTER TABLE user_posts RENAME COLUMN author_id_temp TO author_id;
                
                RAISE NOTICE 'Successfully recreated author_id column as uuid';
        END;
    ELSE
        RAISE NOTICE 'author_id column is already uuid type';
    END IF;
END $$;

-- Re-add the foreign key constraint with correct types
ALTER TABLE user_posts
  ADD CONSTRAINT user_posts_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Fix post_comments table
DROP POLICY IF EXISTS "Users can create comments" ON post_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;
DROP POLICY IF EXISTS "Anyone can read comments" ON post_comments;

ALTER TABLE post_comments 
  DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;

DO $$
DECLARE
    is_text_type boolean;
BEGIN
    SELECT is_text_column('post_comments', 'user_id') INTO is_text_type;
    
    IF is_text_type THEN
        RAISE NOTICE 'Converting post_comments.user_id from text to uuid';
        
        -- Clean up invalid data
        UPDATE post_comments 
        SET user_id = NULL 
        WHERE user_id IS NOT NULL 
          AND user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

        BEGIN
            ALTER TABLE post_comments 
            ALTER COLUMN user_id TYPE uuid USING 
              CASE 
                WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN user_id::uuid 
                ELSE NULL 
              END;
        EXCEPTION
            WHEN others THEN
                ALTER TABLE post_comments ADD COLUMN user_id_temp uuid;
                UPDATE post_comments 
                SET user_id_temp = user_id::uuid 
                WHERE user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
                ALTER TABLE post_comments DROP COLUMN user_id;
                ALTER TABLE post_comments RENAME COLUMN user_id_temp TO user_id;
        END;
    ELSE
        RAISE NOTICE 'post_comments.user_id column is already uuid type';
    END IF;
END $$;

ALTER TABLE post_comments
  ADD CONSTRAINT post_comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Fix post_likes table
DROP POLICY IF EXISTS "Users can manage own likes" ON post_likes;
DROP POLICY IF EXISTS "Anyone can read likes" ON post_likes;

ALTER TABLE post_likes 
  DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;

DO $$
DECLARE
    is_text_type boolean;
BEGIN
    SELECT is_text_column('post_likes', 'user_id') INTO is_text_type;
    
    IF is_text_type THEN
        RAISE NOTICE 'Converting post_likes.user_id from text to uuid';
        
        -- Clean up invalid data
        UPDATE post_likes 
        SET user_id = NULL 
        WHERE user_id IS NOT NULL 
          AND user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

        BEGIN
            ALTER TABLE post_likes 
            ALTER COLUMN user_id TYPE uuid USING 
              CASE 
                WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN user_id::uuid 
                ELSE NULL 
              END;
        EXCEPTION
            WHEN others THEN
                ALTER TABLE post_likes ADD COLUMN user_id_temp uuid;
                UPDATE post_likes 
                SET user_id_temp = user_id::uuid 
                WHERE user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
                ALTER TABLE post_likes DROP COLUMN user_id;
                ALTER TABLE post_likes RENAME COLUMN user_id_temp TO user_id;
        END;
    ELSE
        RAISE NOTICE 'post_likes.user_id column is already uuid type';
    END IF;
END $$;

ALTER TABLE post_likes
  ADD CONSTRAINT post_likes_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Fix post_bookmarks table
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON post_bookmarks;

ALTER TABLE post_bookmarks 
  DROP CONSTRAINT IF EXISTS post_bookmarks_user_id_fkey;

DO $$
DECLARE
    is_text_type boolean;
BEGIN
    SELECT is_text_column('post_bookmarks', 'user_id') INTO is_text_type;
    
    IF is_text_type THEN
        RAISE NOTICE 'Converting post_bookmarks.user_id from text to uuid';
        
        -- Clean up invalid data
        UPDATE post_bookmarks 
        SET user_id = NULL 
        WHERE user_id IS NOT NULL 
          AND user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

        BEGIN
            ALTER TABLE post_bookmarks 
            ALTER COLUMN user_id TYPE uuid USING 
              CASE 
                WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN user_id::uuid 
                ELSE NULL 
              END;
        EXCEPTION
            WHEN others THEN
                ALTER TABLE post_bookmarks ADD COLUMN user_id_temp uuid;
                UPDATE post_bookmarks 
                SET user_id_temp = user_id::uuid 
                WHERE user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
                ALTER TABLE post_bookmarks DROP COLUMN user_id;
                ALTER TABLE post_bookmarks RENAME COLUMN user_id_temp TO user_id;
        END;
    ELSE
        RAISE NOTICE 'post_bookmarks.user_id column is already uuid type';
    END IF;
END $$;

ALTER TABLE post_bookmarks
  ADD CONSTRAINT post_bookmarks_user_id_fkey 
  FOREIGN KEY (user_id) 
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
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

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

-- Create RLS policies for post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON post_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON post_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
  ON post_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON post_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for post_bookmarks
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmarks"
  ON post_bookmarks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Clean up the helper function
DROP FUNCTION IF EXISTS is_text_column(text, text);

-- Verify the setup
DO $$
DECLARE
    profile_count INTEGER;
    post_count INTEGER;
    constraint_exists BOOLEAN;
    author_id_type TEXT;
    user_id_type TEXT;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO post_count FROM user_posts;
    
    -- Check if foreign key constraint exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_posts_author_id_fkey'
    ) INTO constraint_exists;
    
    -- Check the data type of author_id
    SELECT data_type INTO author_id_type
    FROM information_schema.columns 
    WHERE table_name = 'user_posts' 
    AND column_name = 'author_id';
    
    -- Check the data type of user_id in post_comments
    SELECT data_type INTO user_id_type
    FROM information_schema.columns 
    WHERE table_name = 'post_comments' 
    AND column_name = 'user_id';
    
    RAISE NOTICE 'Setup verified: % profiles, % posts, FK constraint exists: %, author_id type: %, user_id type: %', 
                 profile_count, post_count, constraint_exists, author_id_type, user_id_type;
END $$;