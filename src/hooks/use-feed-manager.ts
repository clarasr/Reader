import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { parseFeed, convertRssItemToArticle } from '@/lib/rss';
import { createFeed, getFeeds, getFeedGroups, createFeedGroup } from '@/lib/supabase/api';

export default function useFeedManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  // Load feeds and groups on mount
  useEffect(() => {
    loadFeedsAndGroups();
  }, []);

  const loadFeedsAndGroups = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load feed groups
      const groupsData = await getFeedGroups();
      setGroups(groupsData);
      
      // Load feeds
      const feedsData = await getFeeds();
      setFeeds(feedsData);
    } catch (err) {
      console.error('Error loading feeds and groups:', err);
      setError('Failed to load feeds and groups');
    } finally {
      setIsLoading(false);
    }
  };

  const addFeed = async (url: string, groupId: string | null = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Parse the feed to get metadata
      const feedData = await parseFeed(url);
      
      // Create the feed in the database
      const newFeed = await createFeed({
        title: feedData.title || 'Untitled Feed',
        url: url,
        description: feedData.description || null,
        favicon: feedData.favicon || feedData.image?.url || null,
        group_id: groupId,
      });
      
      // Refresh the feeds list
      await loadFeedsAndGroups();
      
      // Process and store the feed items
      await processFeedItems(newFeed.id, feedData.items);
      
      return newFeed;
    } catch (err) {
      console.error('Error adding feed:', err);
      setError(`Failed to add feed: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const processFeedItems = async (feedId: string, items: any[]) => {
    try {
      // Convert RSS items to our Article format
      const articles = items.map(item => convertRssItemToArticle(item, feedId));
      
      // Insert articles in batches to avoid hitting API limits
      const batchSize = 10;
      for (let i = 0; i < articles.length; i += batchSize) {
        const batch = articles.slice(i, i + batchSize);
        
        // Insert articles, ignoring duplicates (based on URL)
        const { error } = await supabase
          .from('articles')
          .upsert(batch, { onConflict: 'url' });
        
        if (error) {
          console.error('Error inserting articles:', error);
        }
      }
    } catch (err) {
      console.error('Error processing feed items:', err);
    }
  };

  const addGroup = async (name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newGroup = await createFeedGroup(name);
      await loadFeedsAndGroups();
      return newGroup;
    } catch (err) {
      console.error('Error adding group:', err);
      setError(`Failed to add group: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFeeds = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all feeds
      const feedsData = await getFeeds();
      
      // Process each feed
      for (const feed of feedsData) {
        try {
          // Parse the feed
          const feedData = await parseFeed(feed.url);
          
          // Process and store the feed items
          await processFeedItems(feed.id, feedData.items);
          
          // Update the feed's last_fetched timestamp
          await supabase
            .from('feeds')
            .update({ 
              last_fetched: new Date().toISOString(),
              health_status: 'healthy'
            })
            .eq('id', feed.id);
        } catch (err) {
          console.error(`Error refreshing feed ${feed.url}:`, err);
          
          // Update the feed's health status
          await supabase
            .from('feeds')
            .update({ health_status: 'error' })
            .eq('id', feed.id);
        }
      }
      
      // Refresh the feeds list
      await loadFeedsAndGroups();
    } catch (err) {
      console.error('Error refreshing feeds:', err);
      setError('Failed to refresh feeds');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    feeds,
    groups,
    isLoading,
    error,
    addFeed,
    addGroup,
    refreshFeeds,
    loadFeedsAndGroups
  };
}
