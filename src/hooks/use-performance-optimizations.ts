// Optimize performance for the RSS reader app
import { useEffect } from 'react';

// Types of optimizations to apply
export type OptimizationOptions = {
  lazyLoadImages: boolean;
  prefetchArticles: boolean;
  cacheFeeds: boolean;
  limitArticlesPerFeed: number;
  debounceSearchTime: number; // in milliseconds
  throttleScrollEvents: boolean;
  useVirtualization: boolean;
};

// Default optimization settings
export const defaultOptimizations: OptimizationOptions = {
  lazyLoadImages: true,
  prefetchArticles: true,
  cacheFeeds: true,
  limitArticlesPerFeed: 50,
  debounceSearchTime: 300,
  throttleScrollEvents: true,
  useVirtualization: true
};

export function usePerformanceOptimizations(options: Partial<OptimizationOptions> = {}) {
  // Merge provided options with defaults
  const settings: OptimizationOptions = {
    ...defaultOptimizations,
    ...options
  };

  useEffect(() => {
    // Apply lazy loading for images
    if (settings.lazyLoadImages) {
      const images = document.querySelectorAll('img[data-src]');
      
      const lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            lazyLoadObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(image => {
        lazyLoadObserver.observe(image);
      });
      
      return () => {
        lazyLoadObserver.disconnect();
      };
    }
  }, [settings.lazyLoadImages]);

  useEffect(() => {
    // Apply throttling to scroll events
    if (settings.throttleScrollEvents) {
      let ticking = false;
      const scrollHandler = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            // Handle scroll events here
            ticking = false;
          });
          ticking = true;
        }
      };
      
      window.addEventListener('scroll', scrollHandler, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', scrollHandler);
      };
    }
  }, [settings.throttleScrollEvents]);

  // Function to debounce search input
  const debounceSearch = (callback: Function) => {
    let timer: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        callback(value);
      }, settings.debounceSearchTime);
    };
  };

  // Function to optimize image loading
  const optimizeImage = (src: string, width?: number, height?: number) => {
    if (!src) return '';
    
    // If using a CDN or image optimization service, you could modify the URL here
    // For example, with Cloudinary, Imgix, etc.
    
    // For now, just add width and height if provided
    if (width || height) {
      const url = new URL(src);
      if (width) url.searchParams.append('w', width.toString());
      if (height) url.searchParams.append('h', height.toString());
      return url.toString();
    }
    
    return src;
  };

  // Function to prefetch articles
  const prefetchArticles = (articleIds: string[]) => {
    if (!settings.prefetchArticles) return;
    
    // In a real implementation, this would prefetch article data
    // For now, just log the action
    console.log(`Prefetching ${articleIds.length} articles`);
  };

  return {
    settings,
    debounceSearch,
    optimizeImage,
    prefetchArticles
  };
}
