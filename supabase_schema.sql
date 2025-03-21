-- Create tables for RSS Vision app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Feed groups table
CREATE TABLE IF NOT EXISTS feed_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Feeds table
CREATE TABLE IF NOT EXISTS feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES feed_groups(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  favicon TEXT,
  last_fetched TIMESTAMP WITH TIME ZONE,
  health_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, url)
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID REFERENCES feeds(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  content TEXT,
  summary TEXT,
  image_url TEXT,
  categories TEXT[],
  read_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(feed_id, url)
);

-- User article interactions
CREATE TABLE IF NOT EXISTS user_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  swiped_direction TEXT,
  read_position INTEGER DEFAULT 0,
  highlights JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, article_id)
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT DEFAULT 'system',
  font_size INTEGER DEFAULT 16,
  reading_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Row Level Security Policies

-- Profiles table policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Feed groups table policies
ALTER TABLE feed_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feed groups"
  ON feed_groups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feed groups"
  ON feed_groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feed groups"
  ON feed_groups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feed groups"
  ON feed_groups FOR DELETE
  USING (auth.uid() = user_id);

-- Feeds table policies
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feeds"
  ON feeds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feeds"
  ON feeds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feeds"
  ON feeds FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feeds"
  ON feeds FOR DELETE
  USING (auth.uid() = user_id);

-- Articles table policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view articles from their feeds"
  ON articles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM feeds
      WHERE feeds.id = articles.feed_id
      AND feeds.user_id = auth.uid()
    )
  );

-- User articles table policies
ALTER TABLE user_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own article interactions"
  ON user_articles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own article interactions"
  ON user_articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own article interactions"
  ON user_articles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own article interactions"
  ON user_articles FOR DELETE
  USING (auth.uid() = user_id);

-- User settings table policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_feed_groups_updated_at
BEFORE UPDATE ON feed_groups
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_feeds_updated_at
BEFORE UPDATE ON feeds
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_user_articles_updated_at
BEFORE UPDATE ON user_articles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
