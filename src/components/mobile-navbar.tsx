import { useState, useEffect } from 'react';
import { Home, BookOpen, Bookmark, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavbarProps {
  currentPage: 'for-you' | 'focus' | 'saved' | 'manage';
  backgroundImage?: string;
}

export default function MobileNavbar({ currentPage, backgroundImage }: MobileNavbarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="glass-bottom-nav py-2 px-4 md:hidden">
      {backgroundImage && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img 
            src={backgroundImage} 
            alt="Background" 
            className="w-full h-full object-cover"
            style={{ filter: 'blur(10px)', transform: 'scale(1.1)' }}
          />
        </div>
      )}
      <div className="flex items-center justify-around">
        <a href="/" aria-label="For You">
          <Button 
            variant={currentPage === 'for-you' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="rounded-full"
          >
            <Home className="h-5 w-5" />
          </Button>
        </a>
        
        <a href="/focus" aria-label="Focus">
          <Button 
            variant={currentPage === 'focus' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="rounded-full"
          >
            <BookOpen className="h-5 w-5" />
          </Button>
        </a>
        
        <a href="/saved" aria-label="Saved">
          <Button 
            variant={currentPage === 'saved' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="rounded-full"
          >
            <Bookmark className="h-5 w-5" />
          </Button>
        </a>
        
        <a href="/manage" aria-label="Manage Feeds">
          <Button 
            variant={currentPage === 'manage' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </a>
      </div>
    </div>
  );
}
