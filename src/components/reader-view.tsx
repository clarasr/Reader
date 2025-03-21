import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, Share, ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReaderViewProps {
  article: {
    id: string;
    title: string;
    url: string;
    feed: {
      title: string;
    };
    author?: string;
    publishedAt: Date;
    content: string;
    imageUrl?: string;
  };
  onBack: () => void;
  onFavorite: (articleId: string) => void;
  isFavorite: boolean;
  readPosition?: number;
  onReadPositionChange: (position: number) => void;
}

export default function ReaderView({
  article,
  onBack,
  onFavorite,
  isFavorite,
  readPosition = 0,
  onReadPositionChange,
}: ReaderViewProps) {
  const [mounted, setMounted] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(readPosition);
  
  useEffect(() => {
    setMounted(true);
    
    // Scroll to saved position
    if (readPosition > 0) {
      window.scrollTo(0, readPosition);
    }
    
    // Track scroll position
    const handleScroll = () => {
      const position = window.scrollY;
      setCurrentPosition(position);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Save position on unmount
      onReadPositionChange(currentPosition);
    };
  }, [readPosition, onReadPositionChange]);
  
  // Prevent hydration mismatch
  if (!mounted) return null;
  
  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const handleFavorite = () => {
    onFavorite(article.id);
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: article.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(article.url);
      // Show toast notification (would be implemented with a toast component)
    }
  };
  
  return (
    <div className="pb-20">
      <div className="glass-nav py-2 px-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={isFavorite ? "default" : "ghost"}
            size="icon"
            onClick={handleFavorite}
            className="rounded-full"
          >
            <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="rounded-full"
          >
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="reader-content">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-auto rounded-xl mb-6 max-h-[300px] object-cover"
          />
        )}
        
        <h1>{article.title}</h1>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium">{article.feed.title}</p>
            {article.author && (
              <p className="text-sm text-muted-foreground">By {article.author}</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatTimeAgo(article.publishedAt)}
          </p>
        </div>
        
        <div 
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  );
}
