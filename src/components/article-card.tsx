import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Heart, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    url: string;
    feed: {
      title: string;
    };
    author?: string;
    publishedAt: Date;
    summary?: string;
    content?: string;
    imageUrl?: string;
    readTime?: number;
  };
  onSwipe: (direction: 'left' | 'right', articleId: string) => void;
  onFavorite: (articleId: string) => void;
  setBackgroundImage: (imageUrl: string | undefined) => void;
}

export default function ArticleCard({ article, onSwipe, onFavorite, setBackgroundImage }: ArticleCardProps) {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (article.imageUrl) {
      setBackgroundImage(article.imageUrl);
    }
  }, [article.imageUrl, setBackgroundImage]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeDirection('left');
      setTimeout(() => {
        onSwipe('left', article.id);
      }, 300);
    },
    onSwipedRight: () => {
      setSwipeDirection('right');
      setTimeout(() => {
        onSwipe('right', article.id);
      }, 300);
    },
    trackMouse: true
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavorite(article.id);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSwipeDirection('left');
    setTimeout(() => {
      onSwipe('left', article.id);
    }, 300);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSwipeDirection('right');
    setTimeout(() => {
      onSwipe('right', article.id);
    }, 300);
  };

  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div
      {...handlers}
      className={`swipe-card ${swipeDirection ? `swiping-${swipeDirection}` : ''}`}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 flex flex-col h-[70vh] max-h-[600px]"
      >
        {article.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden h-40">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {article.feed.title}
          </Badge>
          <span className="time-ago text-xs">
            {formatTimeAgo(article.publishedAt)}
          </span>
        </div>
        
        <h2 className="text-xl font-bold mb-2">{article.title}</h2>
        
        {article.author && (
          <p className="text-sm text-muted-foreground mb-3">
            By {article.author}
          </p>
        )}
        
        <div className="flex-grow overflow-hidden">
          <p className="text-sm line-clamp-[12]">
            {article.summary || article.content?.substring(0, 300) || "No preview available"}
          </p>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {article.readTime || '3'} min read
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleDismiss}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="icon"
              className={`rounded-full favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleFavorite}
            >
              <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
