import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useAuth from '@/hooks/use-auth';

interface NavbarProps {
  currentPage: 'for-you' | 'focus' | 'saved' | 'manage';
  backgroundImage?: string;
}

export default function Navbar({ currentPage, backgroundImage }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { user, signInWithGoogle, signOut, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return null;

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="glass-nav py-2 px-4">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="glass-card border-r-0">
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
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-2 mb-8">
                  <h2 className="text-2xl font-bold">RSS Vision</h2>
                </div>
                
                <nav className="space-y-2 flex-1">
                  <a 
                    href="/" 
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      currentPage === 'for-you' ? 'bg-primary/10 font-medium' : 'hover:bg-primary/5'
                    }`}
                  >
                    For You
                  </a>
                  <a 
                    href="/focus" 
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      currentPage === 'focus' ? 'bg-primary/10 font-medium' : 'hover:bg-primary/5'
                    }`}
                  >
                    Focus
                  </a>
                  <a 
                    href="/saved" 
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      currentPage === 'saved' ? 'bg-primary/10 font-medium' : 'hover:bg-primary/5'
                    }`}
                  >
                    Saved
                  </a>
                  <a 
                    href="/manage" 
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      currentPage === 'manage' ? 'bg-primary/10 font-medium' : 'hover:bg-primary/5'
                    }`}
                  >
                    Manage Feeds
                  </a>
                </nav>
                
                <div className="pt-4 border-t">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                  ) : user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <div className="font-medium">{user.user_metadata?.full_name || user.email}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleLogout}>
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleLogin} className="w-full">
                      Sign in with Google
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <h1 className="text-xl font-semibold">
            {currentPage === 'for-you' && 'For You'}
            {currentPage === 'focus' && 'Focus'}
            {currentPage === 'saved' && 'Saved'}
            {currentPage === 'manage' && 'Manage Feeds'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {!isLoading && (user ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleLogin}>
              Sign in
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
