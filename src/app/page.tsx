import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ArticleCard from '@/components/article-card';
import Navbar from '@/components/navbar';
import MobileNavbar from '@/components/mobile-navbar';
import ForYouHeader from '@/components/for-you-header';
import useFeedManager from '@/hooks/use-feed-manager';
import useArticleManager from '@/hooks/use-article-manager';

export default function ForYouPage() {
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  
  const { feeds, groups, isLoading: feedsLoading } = useFeedManager();
  const { 
    articles, 
    stats, 
    isLoading: articlesLoading, 
    loadArticles,
    saveArticleSwipe,
    toggleFavorite
  } = useArticleManager();
  
  // Filter articles based on selected group/feed
  useEffect(() => {
    const loadFilteredArticles = async () => {
      await loadArticles(selectedFeedId, selectedGroupId);
    };
    
    loadFilteredArticles();
  }, [selectedGroupId, selectedFeedId, loadArticles]);
  
  // Set initial background image
  useEffect(() => {
    if (articles.length > 0 && currentArticleIndex >= 0) {
      setBackgroundImage(articles[currentArticleIndex].image_url);
    }
  }, [articles, currentArticleIndex]);
  
  const handleSwipe = async (direction: 'left' | 'right', articleId: string) => {
    // Save the swipe direction to the database
    await saveArticleSwipe(articleId, direction);
    
    // Move to the next article
    if (currentArticleIndex < articles.length - 1) {
      setCurrentArticleIndex(currentArticleIndex + 1);
    } else {
      // No more articles
      setCurrentArticleIndex(-1);
    }
  };
  
  const handleFavorite = async (articleId: string) => {
    await toggleFavorite(articleId);
  };
  
  const handlePrevious = () => {
    if (currentArticleIndex > 0) {
      setCurrentArticleIndex(currentArticleIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (currentArticleIndex < articles.length - 1) {
      setCurrentArticleIndex(currentArticleIndex + 1);
    }
  };
  
  const isLoading = feedsLoading || articlesLoading;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Blurred background */}
      {backgroundImage && (
        <div className="blurred-bg">
          <img src={backgroundImage} alt="" />
        </div>
      )}
      
      <Navbar currentPage="for-you" backgroundImage={backgroundImage} />
      
      <ForYouHeader
        totalArticles={stats.totalArticles}
        readArticles={stats.readArticles}
        groups={groups}
        feeds={feeds}
        selectedGroupId={selectedGroupId}
        selectedFeedId={selectedFeedId}
        onSelectGroup={setSelectedGroupId}
        onSelectFeed={setSelectedFeedId}
      />
      
      <div className="flex items-center justify-center p-4 pb-24 md:pb-4">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : articles.length > 0 && currentArticleIndex >= 0 ? (
          <div className="relative w-full max-w-md">
            <ArticleCard
              article={{
                id: articles[currentArticleIndex].id,
                title: articles[currentArticleIndex].title,
                url: articles[currentArticleIndex].url,
                feed: {
                  title: articles[currentArticleIndex].feeds?.title || 'Unknown Feed'
                },
                author: articles[currentArticleIndex].author,
                publishedAt: new Date(articles[currentArticleIndex].published_at),
                summary: articles[currentArticleIndex].summary,
                content: articles[currentArticleIndex].content,
                imageUrl: articles[currentArticleIndex].image_url,
                readTime: articles[currentArticleIndex].read_time
              }}
              onSwipe={handleSwipe}
              onFavorite={handleFavorite}
              setBackgroundImage={setBackgroundImage}
            />
            
            {/* Desktop navigation arrows */}
            <div className="hidden md:flex justify-between absolute top-1/2 left-0 right-0 -mx-16">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-background/50 backdrop-blur-sm"
                onClick={handlePrevious}
                disabled={currentArticleIndex <= 0}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-background/50 backdrop-blur-sm"
                onClick={handleNext}
                disabled={currentArticleIndex >= articles.length - 1}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground mb-6">
              You've gone through all articles in your feed.
            </p>
            <Button onClick={() => setCurrentArticleIndex(0)}>
              Start Over
            </Button>
          </div>
        )}
      </div>
      
      <MobileNavbar currentPage="for-you" backgroundImage={backgroundImage} />
    </div>
  );
}
