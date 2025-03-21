import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatRelativeTime } from '@/lib/rss';

export default function useArticleManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [favoriteArticles, setFavoriteArticles] = useState<any[]>([]);
  const [readArticles, setReadArticles] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalArticles: 0,
    readArticles: 0,
    savedArticles: 0,
    favoriteArticles: 0
  });

  // Load articles on mount
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async (feedId?: string, groupId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('articles')
        .select(`
          *,
          feeds (
            id,
            title,
            favicon
          ),
          user_articles (
            is_read,
            is_favorite,
            read_position,
            swiped_direction
          )
        `)
        .order('published_at', { ascending: false });
      
      if (feedId) {
        query = query.eq('feed_id', feedId);
      }
      
      if (groupId) {
        query = query.eq('feeds.group_id', groupId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Process articles to add formatted dates and other computed properties
      const processedArticles = data?.map(article => ({
        ...article,
        timeAgo: formatRelativeTime(article.published_at),
        isRead: article.user_articles?.[0]?.is_read || false,
        isFavorite: article.user_articles?.[0]?.is_favorite || false,
        readPosition: article.user_articles?.[0]?.read_position || 0,
        swipedDirection: article.user_articles?.[0]?.swiped_direction || null
      })) || [];
      
      setArticles(processedArticles);
      
      // Filter for saved and favorite articles
      const saved = processedArticles.filter(article => 
        article.swipedDirection === 'right' || article.isFavorite
      );
      setSavedArticles(saved);
      
      const favorites = processedArticles.filter(article => article.isFavorite);
      setFavoriteArticles(favorites);
      
      const read = processedArticles.filter(article => article.isRead);
      setReadArticles(read);
      
      // Update stats
      setStats({
        totalArticles: processedArticles.length,
        readArticles: read.length,
        savedArticles: saved.length,
        favoriteArticles: favorites.length
      });
      
      return processedArticles;
    } catch (err) {
      console.error('Error loading articles:', err);
      setError('Failed to load articles');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const markArticleAsRead = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('user_articles')
        .upsert({
          article_id: articleId,
          is_read: true
        }, {
          onConflict: 'user_id,article_id'
        });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, isRead: true } 
          : article
      ));
      
      // Update read articles count
      setStats(prev => ({
        ...prev,
        readArticles: prev.readArticles + 1
      }));
      
      return true;
    } catch (err) {
      console.error('Error marking article as read:', err);
      return false;
    }
  };

  const saveArticleSwipe = async (articleId: string, direction: 'left' | 'right') => {
    try {
      const { error } = await supabase
        .from('user_articles')
        .upsert({
          article_id: articleId,
          swiped_direction: direction
        }, {
          onConflict: 'user_id,article_id'
        });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, swipedDirection: direction } 
          : article
      ));
      
      // If swiped right, add to saved articles
      if (direction === 'right') {
        const article = articles.find(a => a.id === articleId);
        if (article) {
          setSavedArticles(prev => [...prev, { ...article, swipedDirection: direction }]);
          setStats(prev => ({
            ...prev,
            savedArticles: prev.savedArticles + 1
          }));
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error saving article swipe:', err);
      return false;
    }
  };

  const toggleFavorite = async (articleId: string) => {
    try {
      // Get the current article
      const article = articles.find(a => a.id === articleId);
      if (!article) return false;
      
      // Toggle the favorite status
      const newFavoriteStatus = !article.isFavorite;
      
      const { error } = await supabase
        .from('user_articles')
        .upsert({
          article_id: articleId,
          is_favorite: newFavoriteStatus
        }, {
          onConflict: 'user_id,article_id'
        });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, isFavorite: newFavoriteStatus } 
          : article
      ));
      
      // Update favorite articles
      if (newFavoriteStatus) {
        const article = articles.find(a => a.id === articleId);
        if (article) {
          setFavoriteArticles(prev => [...prev, { ...article, isFavorite: true }]);
          setStats(prev => ({
            ...prev,
            favoriteArticles: prev.favoriteArticles + 1
          }));
        }
      } else {
        setFavoriteArticles(prev => prev.filter(a => a.id !== articleId));
        setStats(prev => ({
          ...prev,
          favoriteArticles: prev.favoriteArticles - 1
        }));
      }
      
      return true;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return false;
    }
  };

  const saveReadPosition = async (articleId: string, position: number) => {
    try {
      const { error } = await supabase
        .from('user_articles')
        .upsert({
          article_id: articleId,
          read_position: position
        }, {
          onConflict: 'user_id,article_id'
        });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, readPosition: position } 
          : article
      ));
      
      return true;
    } catch (err) {
      console.error('Error saving read position:', err);
      return false;
    }
  };

  return {
    articles,
    savedArticles,
    favoriteArticles,
    readArticles,
    stats,
    isLoading,
    error,
    loadArticles,
    markArticleAsRead,
    saveArticleSwipe,
    toggleFavorite,
    saveReadPosition
  };
}
