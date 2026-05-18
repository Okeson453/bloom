-- Create user_wallets table for storing user balance and transaction history
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  available_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  invested_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  total_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);

-- Enable RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: users can only view/update their own wallet
CREATE POLICY "Users can view their own wallet"
  ON user_wallets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON user_wallets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage wallets"
  ON user_wallets
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.total_balance = NEW.available_balance + NEW.invested_balance;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_wallets_update_timestamp
BEFORE UPDATE ON user_wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_timestamp();
