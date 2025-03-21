-- Create schema for RSS reader app

-- Users table (managed by Supabase Auth)
-- We'll create a profiles table to store additional user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feed groups table
CREATE TABLE IF NOT EXISTS feed_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feeds table
CREATE TABLE IF NOT EXISTS feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  group_id UUID REFERENCES feed_groups(id),
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  description TEXT,
  favicon TEXT,
  last_fetched TIMESTAMP WITH TIME ZONE,
  health_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID REFERENCES feeds(id) NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  content TEXT,
  summary TEXT,
  image_url TEXT,
  categories TEXT[],
  read_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User article interactions
CREATE TABLE IF NOT EXISTS user_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  article_id UUID REFERENCES articles(id) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  read_position INTEGER DEFAULT 0,
  swiped_direction TEXT,
  notes TEXT,
  highlights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  theme TEXT DEFAULT 'system',
  font_size TEXT DEFAULT 'medium',
  enable_text_to_speech BOOLEAN DEFAULT FALSE,
  keyboard_shortcuts JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feeds_user_id ON feeds(user_id);
CREATE INDEX IF NOT EXISTS idx_feeds_group_id ON feeds(group_id);
CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles(feed_id);
CREATE INDEX IF NOT EXISTS idx_user_articles_user_id ON user_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_articles_article_id ON user_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_user_articles_is_read ON user_articles(is_read);
CREATE INDEX IF NOT EXISTS idx_user_articles_is_favorite ON user_articles(is_favorite);

-- Create RLS policies
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: Users can only view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Feed groups: Users can only CRUD their own feed groups
CREATE POLICY "Users can CRUD own feed groups" ON feed_groups USING (auth.uid() = user_id);

-- Feeds: Users can only CRUD their own feeds
CREATE POLICY "Users can CRUD own feeds" ON feeds USING (auth.uid() = user_id);

-- Articles: Users can view articles from their feeds
CREATE POLICY "Users can view articles from their feeds" ON articles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM feeds WHERE feeds.id = articles.feed_id AND feeds.user_id = auth.uid()
    )
  );

-- User articles: Users can only CRUD their own article interactions
CREATE POLICY "Users can CRUD own article interactions" ON user_articles USING (auth.uid() = user_id);

-- User settings: Users can only CRUD their own settings
CREATE POLICY "Users can CRUD own settings" ON user_settings USING (auth.uid() = user_id);

-- Create functions and triggers
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_groups_updated_at
BEFORE UPDATE ON feed_groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feeds_updated_at
BEFORE UPDATE ON feeds
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_articles_updated_at
BEFORE UPDATE ON user_articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
