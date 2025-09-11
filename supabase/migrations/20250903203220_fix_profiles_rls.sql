-- Fix Row Level Security policies for profiles table
-- Add missing INSERT policy to allow users to create their own profile

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by owner only" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Optional: Allow users to delete their own profile (if needed)
-- CREATE POLICY "Users can delete their own profile"
--   ON profiles FOR DELETE 
--   USING (auth.uid() = id);
