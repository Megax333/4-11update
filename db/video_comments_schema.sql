-- Create video comments table
CREATE TABLE IF NOT EXISTS video_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  xce_amount DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by video
CREATE INDEX IF NOT EXISTS video_comments_video_id_idx ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS video_comments_user_id_idx ON video_comments(user_id);

-- Create or update user_balances table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  xce_balance DECIMAL NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS user_balances_user_id_idx ON user_balances(user_id);

-- Add RLS policies for video_comments
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Anyone can read comments" 
  ON video_comments FOR SELECT USING (true);

-- Only authenticated users can insert their own comments
CREATE POLICY "Authenticated users can insert their own comments" 
  ON video_comments FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Only comment owners can update their comments
CREATE POLICY "Users can update their own comments" 
  ON video_comments FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only comment owners can delete their comments
CREATE POLICY "Users can delete their own comments" 
  ON video_comments FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- Add RLS policies for user_balances
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- Users can view their own balance
CREATE POLICY "Users can view their own balance" 
  ON user_balances FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

-- Users cannot directly modify their balance (should be done by server functions)
CREATE POLICY "Only system can update balances" 
  ON user_balances FOR UPDATE 
  USING (false);

-- Create function to create default balance for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_balances (user_id, xce_balance)
  VALUES (NEW.id, 10); -- Default 10 XCE for new users
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function whenever a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
