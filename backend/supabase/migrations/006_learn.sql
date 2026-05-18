-- Create articles table (educational content)
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('basics', 'strategies', 'market-news', 'risk-management')),
  author TEXT,
  featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create learn_progress table (tracks user progress through articles)
CREATE TABLE IF NOT EXISTS learn_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  progress_percent INT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, article_id)
);

-- Create indexes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_learn_progress_user_id ON learn_progress(user_id);
CREATE INDEX idx_learn_progress_article_id ON learn_progress(article_id);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for articles (public read)
CREATE POLICY "Anyone can view articles"
  ON articles FOR SELECT
  USING (TRUE);

-- RLS Policies for learn_progress
CREATE POLICY "Users can view their own progress"
  ON learn_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create progress records"
  ON learn_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON learn_progress FOR UPDATE
  USING (auth.uid() = user_id);
