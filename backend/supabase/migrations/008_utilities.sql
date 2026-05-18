-- Create additional indexes and enable extensions for RLS policy performance
CREATE EXTENSION IF NOT EXISTS "pg_cron" SCHEMA extensions;

-- Create a function to delete expired price cache entries
CREATE OR REPLACE FUNCTION delete_expired_prices()
RETURNS void AS $$
BEGIN
  DELETE FROM price_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule the cleanup job to run daily at 2 AM UTC
-- This will be managed through Supabase UI or environment

-- Create a function to generate portfolio snapshots
CREATE OR REPLACE FUNCTION create_portfolio_snapshot()
RETURNS void AS $$
BEGIN
  INSERT INTO snapshots (user_id, portfolio_id, total_value, snapshot_date)
  SELECT 
    p.user_id,
    p.id,
    COALESCE(SUM(pa.current_price * pa.quantity), 0) as total_value,
    CURRENT_DATE
  FROM portfolios p
  LEFT JOIN portfolio_assets pa ON p.id = pa.portfolio_id
  GROUP BY p.id, p.user_id
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean up old snapshots (keep only 1 year of history)
CREATE OR REPLACE FUNCTION cleanup_old_snapshots()
RETURNS void AS $$
BEGIN
  DELETE FROM snapshots 
  WHERE snapshot_date < CURRENT_DATE - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;
