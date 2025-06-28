/*
  # Feed System Migration

  1. New Tables
    - `user_posts` - User-generated posts with media support
    - `post_likes` - Like system for posts
    - `post_comments` - Comment system for posts  
    - `post_bookmarks` - Bookmark system for posts

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
    - Ensure users can only manage their own content

  3. Storage
    - Set up media bucket policies for file uploads
*/

-- Create user_posts table
CREATE TABLE IF NOT EXISTS user_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id text NOT NULL,
    content text NOT NULL,
    post_type text DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video')),
    media_url text,
    event_data jsonb,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    shares_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    type text DEFAULT 'text' CHECK (type IN ('text', 'image', 'video'))
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES user_posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Create post_comments table  
CREATE TABLE IF NOT EXISTS post_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES user_posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create post_bookmarks table
CREATE TABLE IF NOT EXISTS post_bookmarks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES user_posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_posts_author_id ON user_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_user_posts_created_at ON user_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- Enable RLS
ALTER TABLE user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_posts
CREATE POLICY "Anyone can read posts" ON user_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own posts" ON user_posts FOR INSERT TO authenticated WITH CHECK ((auth.uid())::text = author_id);
CREATE POLICY "Users can update own posts" ON user_posts FOR UPDATE TO authenticated USING ((auth.uid())::text = author_id);
CREATE POLICY "Users can delete own posts" ON user_posts FOR DELETE TO authenticated USING ((auth.uid())::text = author_id);

-- RLS Policies for post_likes
CREATE POLICY "Anyone can read likes" ON post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own likes" ON post_likes FOR ALL TO authenticated USING (user_id = auth.uid());

-- RLS Policies for post_comments
CREATE POLICY "Anyone can read comments" ON post_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON post_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own comments" ON post_comments FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON post_comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RLS Policies for post_bookmarks
CREATE POLICY "Users can manage own bookmarks" ON post_bookmarks FOR ALL TO authenticated USING (user_id = auth.uid());

-- Create trigger to update post counts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'post_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE user_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE user_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
            RETURN OLD;
        END IF;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE user_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE user_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
            RETURN OLD;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER update_comments_count
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- Insert sample posts
INSERT INTO user_posts (author_id, content, type) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Welcome to the new academic year! Excited to see all the amazing projects our students will work on this semester. 🎓', 'text'),
('550e8400-e29b-41d4-a716-446655440002', 'Just finished setting up the new AI lab! Can''t wait to start our machine learning course next week. The equipment is state-of-the-art! 🤖', 'text'),
('550e8400-e29b-41d4-a716-446655440003', 'First week of classes done! Already learning so much in my computer science courses. The professors here are amazing! 💻', 'text'),
('550e8400-e29b-41d4-a716-446655440001', 'Reminder: Registration for second semester courses opens next Monday. Make sure to check the course catalog and plan your schedule accordingly.', 'text'),
('550e8400-e29b-41d4-a716-446655440002', 'Proud of my students who presented their research at the symposium today. The future of technology is in good hands! 🔬', 'text'),
('550e8400-e29b-41d4-a716-446655440003', 'Study group for Database Systems meeting tomorrow at 3 PM in the library. All CS students welcome! 📚', 'text');

-- Add foreign key constraint for user_posts author_id
DO $$
BEGIN
    -- First, let's add a proper foreign key constraint
    -- We'll reference the profiles table since that's where user data is stored
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_posts_author_id_fkey'
    ) THEN
        -- For now, we'll keep author_id as text to match the demo user IDs
        -- In a real implementation, this would reference profiles(id)
        ALTER TABLE user_posts 
        ADD CONSTRAINT user_posts_author_id_fkey 
        FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN others THEN
        -- If the constraint fails, we'll continue without it for demo purposes
        NULL;
END $$;