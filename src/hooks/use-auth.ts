import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true);
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          throw error;
        }
        setUser(user);
      } catch (error: any) {
        setError(error.message);
        console.error('Error getting user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN') {
          router.refresh();
        }
        if (event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error signing in with Google:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    signInWithGoogle,
    signOut,
  };
}
