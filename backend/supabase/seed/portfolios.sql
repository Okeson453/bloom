-- Seed data for portfolios and portfolio_assets
-- This is sample data to help with development and testing

-- Insert sample user (replace with actual user ID from Supabase Auth)
-- Example: 550e8400-e29b-41d4-a716-446655440000

-- Insert sample portfolios
INSERT INTO portfolios (user_id, name, description, risk_level, total_invested, current_value)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Core Growth Portfolio', 'Long-term growth portfolio', 'medium', 25000, 28500),
  ('550e8400-e29b-41d4-a716-446655440000', 'Dividend Income', 'High-dividend stocks', 'low', 15000, 15750),
  ('550e8400-e29b-41d4-a716-446655440000', 'Tech Focused', 'Technology sector focus', 'high', 10000, 12000)
ON CONFLICT DO NOTHING;

-- Insert sample portfolio assets
INSERT INTO portfolio_assets (portfolio_id, symbol, quantity, purchase_price, current_price, weight)
VALUES
  ((SELECT id FROM portfolios WHERE name = 'Core Growth Portfolio' LIMIT 1), 'VTI', 50, 200, 220, 0.40),
  ((SELECT id FROM portfolios WHERE name = 'Core Growth Portfolio' LIMIT 1), 'BND', 100, 80, 78, 0.30),
  ((SELECT id FROM portfolios WHERE name = 'Core Growth Portfolio' LIMIT 1), 'VEA', 75, 50, 52, 0.30),
  ((SELECT id FROM portfolios WHERE name = 'Dividend Income' LIMIT 1), 'VYM', 60, 150, 155, 0.50),
  ((SELECT id FROM portfolios WHERE name = 'Dividend Income' LIMIT 1), 'SCHD', 40, 75, 78, 0.50),
  ((SELECT id FROM portfolios WHERE name = 'Tech Focused' LIMIT 1), 'QQQ', 25, 350, 380, 0.60),
  ((SELECT id FROM portfolios WHERE name = 'Tech Focused' LIMIT 1), 'ARKK', 30, 65, 72, 0.40)
ON CONFLICT (portfolio_id, symbol) DO NOTHING;
