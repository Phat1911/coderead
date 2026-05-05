-- Add points column to user_progress (defaults to 1 for existing rows)
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1;

-- Update leaderboard function to sum points instead of counting rows
-- This returns the total points per user, ranked highest to lowest.
CREATE OR REPLACE FUNCTION get_leaderboard(row_limit INTEGER DEFAULT 20)
RETURNS TABLE(user_id UUID, username TEXT, total_points INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    pr.username,
    COALESCE(SUM(p.points), 0)::INTEGER as total_points
  FROM user_progress p
  JOIN profiles pr ON pr.id = p.user_id
  GROUP BY p.user_id, pr.username
  ORDER BY total_points DESC
  LIMIT row_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
