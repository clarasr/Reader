import { useState } from 'react';
import { parseFeed } from '@/lib/rss';

// Types for newsletter to RSS conversion
export type NewsletterSource = {
  email: string;
  name?: string;
  description?: string;
  rssUrl?: string;
  status: 'pending' | 'converted' | 'failed';
  error?: string;
};

export default function useNewsletterToRss() {
  const [newsletters, setNewsletters] = useState<NewsletterSource[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common newsletter providers and their RSS patterns
  const knownProviders = [
    {
      domain: 'substack.com',
      getRssUrl: (email: string) => {
        const username = email.split('@')[0];
        return `https://${username}.substack.com/feed`;
      }
    },
    {
      domain: 'buttondown.email',
      getRssUrl: (email: string) => {
        const username = email.split('@')[0];
        return `https://${username}.buttondown.email/rss`;
      }
    },
    {
      domain: 'convertkit.com',
      getRssUrl: (email: string) => {
        // ConvertKit requires a specific feed ID, which we can't guess
        // This is just a placeholder pattern
        return null;
      }
    },
    {
      domain: 'revue.co',
      getRssUrl: (email: string) => {
        const username = email.split('@')[0];
        return `https://www.getrevue.co/profile/${username}/issues.rss`;
      }
    }
  ];

  // Add a newsletter to convert
  const addNewsletter = (email: string, name?: string, description?: string) => {
    // Validate email format
    if (!email.includes('@')) {
      setError('Invalid email format');
      return false;
    }

    // Check if already added
    if (newsletters.some(n => n.email === email)) {
      setError('This newsletter is already in your list');
      return false;
    }

    // Add to list
    const newNewsletter: NewsletterSource = {
      email,
      name: name || email,
      description,
      status: 'pending'
    };

    setNewsletters(prev => [...prev, newNewsletter]);
    return true;
  };

  // Try to convert a newsletter to RSS
  const convertNewsletterToRss = async (email: string) => {
    setIsConverting(true);
    setError(null);

    try {
      // Find the newsletter in our list
      const newsletter = newsletters.find(n => n.email === email);
      if (!newsletter) {
        throw new Error('Newsletter not found');
      }

      // Extract domain from email
      const domain = email.split('@')[1];
      
      // Check if it's a known provider
      const provider = knownProviders.find(p => domain.includes(p.domain));
      let rssUrl = provider?.getRssUrl(email);

      // If we couldn't determine the RSS URL from known providers
      if (!rssUrl) {
        // Try common patterns
        const username = email.split('@')[0];
        const possibleUrls = [
          `https://${domain}/feed/${username}`,
          `https://${domain}/${username}/feed`,
          `https://${domain}/users/${username}/feed`,
          `https://${username}.${domain}/feed`,
          `https://newsletter.${domain}/${username}/rss`
        ];

        // Try each possible URL
        for (const url of possibleUrls) {
          try {
            // Try to parse the feed to see if it's valid
            await parseFeed(url);
            rssUrl = url;
            break;
          } catch (err) {
            // Not a valid feed, try the next one
            continue;
          }
        }
      }

      // If we found a valid RSS URL
      if (rssUrl) {
        // Update the newsletter in our list
        setNewsletters(prev => 
          prev.map(n => 
            n.email === email 
              ? { ...n, rssUrl, status: 'converted' } 
              : n
          )
        );
        return { success: true, rssUrl };
      } else {
        // Couldn't find a valid RSS URL
        setNewsletters(prev => 
          prev.map(n => 
            n.email === email 
              ? { ...n, status: 'failed', error: 'Could not find RSS feed for this newsletter' } 
              : n
          )
        );
        return { success: false, error: 'Could not find RSS feed for this newsletter' };
      }
    } catch (err: any) {
      console.error('Error converting newsletter to RSS:', err);
      
      // Update the newsletter in our list
      setNewsletters(prev => 
        prev.map(n => 
          n.email === email 
            ? { ...n, status: 'failed', error: err.message || 'Unknown error' } 
            : n
        )
      );
      
      return { success: false, error: err.message || 'Unknown error' };
    } finally {
      setIsConverting(false);
    }
  };

  // Remove a newsletter from the list
  const removeNewsletter = (email: string) => {
    setNewsletters(prev => prev.filter(n => n.email !== email));
    return true;
  };

  // Get all newsletters
  const getNewsletters = () => {
    return newsletters;
  };

  // Get converted RSS feeds
  const getConvertedRssFeeds = () => {
    return newsletters
      .filter(n => n.status === 'converted' && n.rssUrl)
      .map(n => ({
        url: n.rssUrl!,
        name: n.name || n.email,
        description: n.description
      }));
  };

  return {
    newsletters,
    isConverting,
    error,
    addNewsletter,
    convertNewsletterToRss,
    removeNewsletter,
    getNewsletters,
    getConvertedRssFeeds
  };
}
