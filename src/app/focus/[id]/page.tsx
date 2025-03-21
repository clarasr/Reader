import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReaderView from '@/components/reader-view';
import useArticleManager from '@/hooks/use-article-manager';

export default function FocusPage() {
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [readPosition, setReadPosition] = useState(0);
  
  const { 
    articles, 
    isLoading, 
    error, 
    toggleFavorite,
    saveReadPosition,
    markArticleAsRead
  } = useArticleManager();
  
  // Get article ID from URL params
  const params = useParams();
  const articleId = params?.id as string;
  
  useEffect(() => {
    if (articleId && articles.length > 0) {
      const foundArticle = articles.find(a => a.id === articleId);
      if (foundArticle) {
        setArticle(foundArticle);
        setIsFavorite(foundArticle.isFavorite);
        setReadPosition(foundArticle.readPosition || 0);
        
        // Mark as read if not already
        if (!foundArticle.isRead) {
          markArticleAsRead(articleId);
        }
      }
    }
  }, [articleId, articles, markArticleAsRead]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleFavorite = async () => {
    if (article) {
      await toggleFavorite(article.id);
      setIsFavorite(!isFavorite);
    }
  };
  
  const handleReadPositionChange = async (position: number) => {
    if (article) {
      setReadPosition(position);
      await saveReadPosition(article.id, position);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }
  
  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Article not found</h2>
        <p className="text-muted-foreground mb-6">
          The article you're looking for could not be loaded.
        </p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <ReaderView
        article={{
          id: article.id,
          title: article.title,
          url: article.url,
          feed: {
            title: article.feeds?.title || 'Unknown Feed'
          },
          author: article.author,
          publishedAt: new Date(article.published_at),
          content: article.content,
          imageUrl: article.image_url
        }}
        onBack={handleBack}
        onFavorite={handleFavorite}
        isFavorite={isFavorite}
        readPosition={readPosition}
        onReadPositionChange={handleReadPositionChange}
      />
    </div>
  );
}
