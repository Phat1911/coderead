-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Creates the quiz_scores table used by the multiple-choice quiz system.
-- One row per (user, challenge) — the UNIQUE constraint records the first attempt only.
-- is_correct tracks whether the user answered correctly (true) or not (false).

CREATE TABLE IF NOT EXISTS quiz_scores (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id  text        NOT NULL,
  is_correct    boolean     NOT NULL DEFAULT false,
  answered_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_scores_user_challenge_unique UNIQUE (user_id, challenge_id)
);

-- If the table already exists, run this instead to add the column:
-- ALTER TABLE quiz_scores ADD COLUMN IF NOT EXISTS is_correct boolean NOT NULL DEFAULT false;

-- Row-Level Security: users can only read/write their own rows.
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own quiz scores"
  ON quiz_scores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own quiz scores"
  ON quiz_scores FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Optional: allow the leaderboard RPC (SECURITY DEFINER) to aggregate scores.
-- If you want quiz_scores to feed into the leaderboard, update get_leaderboard()
-- to JOIN or UNION quiz_scores. The existing function counts user_progress rows,
-- so quiz completions are already tracked there via the upsert in QuizQuestion.tsx.
