-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Adds is_correct to user_progress so the profile page can show ✓ / ✗ per challenge.
-- Existing rows default to false; they will be upgraded to true the next time the
-- user reveals (non-quiz) or answers correctly (quiz).

ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS is_correct boolean NOT NULL DEFAULT false;
