import { supabase } from './client';
import { PostgrestError } from '@supabase/supabase-js';

// Types
export type FeedGroup = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Feed = {
  id: string;
  user_id: string;
  group_id: string | null;
  title: string;
  url: string;
  description: string | null;
  favicon: string | null;
  last_fetched: string | null;
  health_status: string;
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: string;
  feed_id: string;
  title: string;
  url: string;
  author: string | null;
  published_at: string | null;
  content: string | null;
  summary: string | null;
  image_url: string | null;
  categories: string[] | null;
  read_time: number | null;
  created_at: string;
};

export type UserArticle = {
  id: string;
  user_id: string;
  article_id: string;
  is_read: boolean;
  is_favorite: boolean;
  read_position: number;
  swiped_direction: string | null;
  notes: string | null;
  highlights: any | null;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  font_size: 'small' | 'medium' | 'large';
  enable_text_to_speech: boolean;
  keyboard_shortcuts: Record<string, string> | null;
  created_at: string;
  updated_at: string;
};

// Feed Groups
export const getFeedGroups = async () => {
  const { data, error } = await supabase
    .from('feed_groups')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as FeedGroup[];
};

export const createFeedGroup = async (name: string) => {
  const { data, error } = await supabase
    .from('feed_groups')
    .insert({ name })
    .select()
    .single();
  
  if (error) throw error;
  return data as FeedGroup;
};

export const updateFeedGroup = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from('feed_groups')
    .update({ name })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as FeedGroup;
};

export const deleteFeedGroup = async (id: string) => {
  const { error } = await supabase
    .from('feed_groups')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Feeds
export const getFeeds = async (groupId?: string) => {
  let query = supabase.from('feeds').select('*');
  
  if (groupId) {
    query = query.eq('group_id', groupId);
  }
  
  const { data, error } = await query.order('title');
  
  if (error) throw error;
  return data as Feed[];
};

export const createFeed = async (feed: Omit<Feed, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'health_status' | 'last_fetched'>) => {
  const { data, error } = await supabase
    .from('feeds')
    .insert(feed)
    .select()
    .single();
  
  if (error) throw error;
  return data as Feed;
};

export const updateFeed = async (id: string, feed: Partial<Omit<Feed, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
  const { data, error } = await supabase
    .from('feeds')
    .update(feed)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Feed;
};

export const deleteFeed = async (id: string) => {
  const { error } = await supabase
    .from('feeds')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Articles
export const getArticles = async (feedId?: string, isRead?: boolean, isFavorite?: boolean) => {
  let query = supabase
    .from('articles')
    .select(`
      *,
      user_articles(*)
    `);
  
  if (feedId) {
    query = query.eq('feed_id', feedId);
  }
  
  if (isRead !== undefined) {
    query = query.eq('user_articles.is_read', isRead);
  }
  
  if (isFavorite !== undefined) {
    query = query.eq('user_articles.is_favorite', isFavorite);
  }
  
  const { data, error } = await query.order('published_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getArticle = async (id: string) => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      user_articles(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserArticle = async (articleId: string, updates: Partial<Omit<UserArticle, 'id' | 'user_id' | 'article_id' | 'created_at' | 'updated_at'>>) => {
  const { data: existingRecord, error: fetchError } = await supabase
    .from('user_articles')
    .select('*')
    .eq('article_id', articleId)
    .maybeSingle();
  
  if (fetchError) throw fetchError;
  
  let result;
  
  if (existingRecord) {
    // Update existing record
    const { data, error } = await supabase
      .from('user_articles')
      .update(updates)
      .eq('article_id', articleId)
      .select()
      .single();
    
    if (error) throw error;
    result = data;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('user_articles')
      .insert({
        article_id: articleId,
        ...updates
      })
      .select()
      .single();
    
    if (error) throw error;
    result = data;
  }
  
  return result as UserArticle;
};

// User Settings
export const getUserSettings = async () => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" error
  
  if (!data) {
    // Create default settings if none exist
    return createUserSettings({
      theme: 'system',
      font_size: 'medium',
      enable_text_to_speech: false,
      keyboard_shortcuts: null
    });
  }
  
  return data as UserSettings;
};

export const createUserSettings = async (settings: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('user_settings')
    .insert(settings)
    .select()
    .single();
  
  if (error) throw error;
  return data as UserSettings;
};

export const updateUserSettings = async (updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .select()
    .single();
  
  if (error) throw error;
  return data as UserSettings;
};
