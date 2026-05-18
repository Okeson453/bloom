-- Seed data for educational articles

INSERT INTO articles (slug, title, description, content, category, author, featured, published_at)
VALUES
  (
    'getting-started-investing',
    'Getting Started with Investing',
    'Learn the basics of investing and why it matters',
    '<h2>Introduction</h2><p>Investing is a powerful way to build wealth over time...</p>',
    'basics',
    'Bloom Finance',
    TRUE,
    NOW()
  ),
  (
    'portfolio-diversification',
    'The Power of Portfolio Diversification',
    'Why spreading your investments matters',
    '<h2>Diversification Principles</h2><p>Don''t put all your eggs in one basket...</p>',
    'strategies',
    'Bloom Finance',
    TRUE,
    NOW()
  ),
  (
    'dollar-cost-averaging',
    'Understanding Dollar-Cost Averaging',
    'A practical investment strategy for beginners',
    '<h2>What is DCA?</h2><p>Dollar-cost averaging is investing a fixed amount regularly...</p>',
    'strategies',
    'Bloom Finance',
    FALSE,
    NOW()
  ),
  (
    'market-volatility',
    'Dealing with Market Volatility',
    'How to stay calm during market swings',
    '<h2>Understanding Volatility</h2><p>Market fluctuations are normal...</p>',
    'risk-management',
    'Bloom Finance',
    FALSE,
    NOW()
  ),
  (
    'emergency-fund',
    'Building Your Emergency Fund',
    'Financial security starts with an emergency fund',
    '<h2>Why Emergency Funds Matter</h2><p>Before investing, ensure you have adequate liquid savings...</p>',
    'basics',
    'Bloom Finance',
    TRUE,
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;
