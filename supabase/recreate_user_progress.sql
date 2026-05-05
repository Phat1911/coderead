-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor → New query
-- WARNING: drops all existing progress data
-- ============================================================

-- 1. Drop existing table (cascades to any dependent policies/indexes)
DROP TABLE IF EXISTS user_progress CASCADE;

-- 2. Recreate with all columns including is_correct
CREATE TABLE user_progress (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id  text        NOT NULL,
  is_correct    boolean     NOT NULL DEFAULT false,
  completed_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_progress_user_challenge_unique UNIQUE (user_id, challenge_id)
);

-- 3. Row-Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Users can insert their own rows
CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own rows (profile page)
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own rows (upsert ON CONFLICT DO UPDATE needs this)
CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
