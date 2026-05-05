-- ============================================================
-- Run this in Supabase Dashboard -> SQL Editor -> New query
--
-- 1. Adds a points column to user_progress.
--    DEFAULT 1 means any upsert that omits the field (e.g. plain
--    "Reveal Explanation" challenges) counts as 1 pt automatically.
--    Debug challenges explicitly pass points: 5.
--
-- 2. Updates get_leaderboard to SUM points instead of counting rows,
--    so a 5-pt debug correct answer is worth 5× a 1-pt reveal.
-- ============================================================

-- 1. Add the column (idempotent — safe to re-run).
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1;

-- 2. Drop the old function first. CREATE OR REPLACE fails when the new signature
--    returns a different row shape — Postgres enforces stable return types.
DROP FUNCTION IF EXISTS get_leaderboard(integer);

-- 3. Recreate leaderboard function to SUM points instead of counting rows.
CREATE FUNCTION get_leaderboard(row_limit INTEGER DEFAULT 20)
RETURNS TABLE(id UUID, username TEXT, completed_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    pr.username,
    COALESCE(SUM(p.points), 0)::INTEGER AS completed_count
  FROM user_progress p
  JOIN profiles pr ON pr.id = p.user_id
  GROUP BY p.user_id, pr.username
  ORDER BY completed_count DESC
  LIMIT row_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
