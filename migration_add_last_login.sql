-- ---------------------------------------------------------------------------
-- SkillBridge Migration: Add last_login_at column to users table
--
-- How to apply:
-- 1. Open Supabase Project Dashboard
-- 2. Go to SQL Editor -> New Query
-- 3. Paste this script and click "Run"
-- ---------------------------------------------------------------------------

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT now();

-- Initialize existing users' last_login_at from updated_at / created_at
UPDATE public.users 
SET last_login_at = COALESCE(updated_at, created_at, now()) 
WHERE last_login_at IS NULL;

-- Create index for high-speed admin sorting and queries
CREATE INDEX IF NOT EXISTS users_last_login_at_idx ON public.users (last_login_at);
