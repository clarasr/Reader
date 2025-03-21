import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

// Types for feed health monitoring
export type FeedHealth = {
  id: string;
  url: string;
  title: string;
  lastFetched: Date | null;
  status: 'healthy' | 'error' | 'unknown';
  errorMessage?: string;
  refreshInterval: number; // in minutes
};

export default function useFeedHealth() {
  const [feedsHealth, setFeedsHealth] = useState<FeedHealth[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load feed health data
  const loadFeedHealth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('feeds')
        .select('id, url, title, last_fetched, health_status');
      
      if (fetchError) throw fetchError;
      
      if (data) {
        const healthData: FeedHealth[] = data.map(feed => ({
          id: feed.id,
          url: feed.url,
          title: feed.title,
          lastFetched: feed.last_fetched ? new Date(feed.last_fetched) : null,
          status: feed.health_status as 'healthy' | 'error' | 'unknown',
          refreshInterval: 60 // Default to 60 minutes
        }));
        
        setFeedsHealth(healthData);
      }
    } catch (err: any) {
      console.error('Error loading feed health:', err);
      setError(err.message || 'Failed to load feed health data');
    } finally {
      setIsLoading(false);
    }
  };

  // Update feed health status
  const updateFeedHealth = async (feedId: string, status: 'healthy' | 'error' | 'unknown', errorMessage?: string) => {
    try {
      const { error: updateError } = await supabase
        .from('feeds')
        .update({ 
          health_status: status,
          last_fetched: new Date().toISOString()
        })
        .eq('id', feedId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setFeedsHealth(prev => 
        prev.map(feed => 
          feed.id === feedId 
            ? { 
                ...feed, 
                status, 
                lastFetched: new Date(),
                errorMessage: errorMessage
              } 
            : feed
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating feed health:', err);
      return false;
    }
  };

  // Set refresh interval for a feed
  const setFeedRefreshInterval = async (feedId: string, intervalMinutes: number) => {
    try {
      // In a real implementation, this would update a database field
      // For now, we'll just update the local state
      setFeedsHealth(prev => 
        prev.map(feed => 
          feed.id === feedId 
            ? { ...feed, refreshInterval: intervalMinutes } 
            : feed
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error setting feed refresh interval:', err);
      return false;
    }
  };

  // Check if feeds need refreshing
  const checkFeedsNeedingRefresh = () => {
    const now = new Date();
    
    return feedsHealth.filter(feed => {
      if (!feed.lastFetched) return true; // Never fetched
      
      const minutesSinceLastFetch = (now.getTime() - feed.lastFetched.getTime()) / (1000 * 60);
      return minutesSinceLastFetch >= feed.refreshInterval;
    });
  };

  // Get feed health statistics
  const getFeedHealthStats = () => {
    const total = feedsHealth.length;
    const healthy = feedsHealth.filter(feed => feed.status === 'healthy').length;
    const error = feedsHealth.filter(feed => feed.status === 'error').length;
    const unknown = feedsHealth.filter(feed => feed.status === 'unknown').length;
    
    return {
      total,
      healthy,
      error,
      unknown,
      healthyPercentage: total > 0 ? (healthy / total) * 100 : 0
    };
  };

  return {
    feedsHealth,
    isLoading,
    error,
    loadFeedHealth,
    updateFeedHealth,
    setFeedRefreshInterval,
    checkFeedsNeedingRefresh,
    getFeedHealthStats
  };
}
