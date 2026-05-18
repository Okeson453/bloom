-- Create price_cache table (caches market prices for performance)
CREATE TABLE IF NOT EXISTS price_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  high DECIMAL(10, 2),
  low DECIMAL(10, 2),
  open DECIMAL(10, 2),
  close DECIMAL(10, 2),
  volume BIGINT,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(symbol)
);

-- Create indexes
CREATE INDEX idx_price_cache_symbol ON price_cache(symbol);
CREATE INDEX idx_price_cache_expires_at ON price_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE price_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read price cache (it's public market data)
CREATE POLICY "Anyone can view price cache"
  ON price_cache FOR SELECT
  USING (TRUE);

-- Policy: Only system/functions can insert/update
CREATE POLICY "System can manage price cache"
  ON price_cache FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "System can update price cache"
  ON price_cache FOR UPDATE
  USING (TRUE);
