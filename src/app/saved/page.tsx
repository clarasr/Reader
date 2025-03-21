import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import MobileNavbar from '@/components/mobile-navbar';
import SavedArticles from '@/components/saved-articles';
import useArticleManager from '@/hooks/use-article-manager';
import { useRouter } from 'next/navigation';

export default function SavedPage() {
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined);
  const router = useRouter();
  
  const { 
    savedArticles, 
    favoriteArticles,
    isLoading, 
    toggleFavorite
  } = useArticleManager();
  
  // Set a random background image from saved articles
  useEffect(() => {
    if (savedArticles.length > 0) {
      const articlesWithImages = savedArticles.filter(article => article.image_url);
      if (articlesWithImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * articlesWithImages.length);
        setBackgroundImage(articlesWithImages[randomIndex].image_url);
      }
    }
  }, [savedArticles]);
  
  const handleOpenArticle = (articleId: string) => {
    router.push(`/focus/${articleId}`);
  };
  
  const handleToggleFavorite = async (articleId: string) => {
    await toggleFavorite(articleId);
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Blurred background */}
      {backgroundImage && (
        <div className="blurred-bg">
          <img src={backgroundImage} alt="" />
        </div>
      )}
      
      <Navbar currentPage="saved" backgroundImage={backgroundImage} />
      
      <SavedArticles
        articles={savedArticles.map(article => ({
          id: article.id,
          title: article.title,
          feed: {
            title: article.feeds?.title || 'Unknown Feed'
          },
          author: article.author,
          publishedAt: new Date(article.published_at),
          summary: article.summary,
          imageUrl: article.image_url,
          readTime: article.read_time,
          tags: article.categories,
          isFavorite: article.isFavorite
        }))}
        onOpenArticle={handleOpenArticle}
        onToggleFavorite={handleToggleFavorite}
      />
      
      <MobileNavbar currentPage="saved" backgroundImage={backgroundImage} />
    </div>
  );
}
