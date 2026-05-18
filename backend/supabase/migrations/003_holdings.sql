-- Create holdings table (user's asset holdings across all portfolios)
CREATE TABLE IF NOT EXISTS holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity DECIMAL(10, 4) NOT NULL,
  average_cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, symbol)
);

-- Create snapshots table (historical performance snapshots)
CREATE TABLE IF NOT EXISTS snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  total_value DECIMAL(12, 2) NOT NULL,
  daily_gain DECIMAL(12, 2),
  daily_gain_percent DECIMAL(5, 2),
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_holdings_user_id ON holdings(user_id);
CREATE INDEX idx_holdings_symbol ON holdings(symbol);
CREATE INDEX idx_snapshots_user_id ON snapshots(user_id);
CREATE INDEX idx_snapshots_portfolio_id ON snapshots(portfolio_id);
CREATE INDEX idx_snapshots_date ON snapshots(snapshot_date);

-- Enable Row Level Security
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for holdings
CREATE POLICY "Users can view their own holdings"
  ON holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create holdings"
  ON holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings"
  ON holdings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for snapshots
CREATE POLICY "Users can view their own snapshots"
  ON snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert snapshots"
  ON snapshots FOR INSERT
  WITH CHECK (TRUE);
