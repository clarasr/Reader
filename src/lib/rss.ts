import Parser from 'rss-parser';
import { Article } from './supabase/api';

// Custom fields for the RSS parser
interface CustomItem {
  content: string;
  contentSnippet: string;
  'content:encoded': string;
  'content:encodedSnippet': string;
  'media:content': {
    $: {
      url: string;
      medium: string;
      height: string;
      width: string;
    };
  };
  enclosure: {
    url: string;
    type: string;
  };
  categories: string[];
}

interface CustomFeed {
  image: {
    url: string;
    title: string;
    link: string;
  };
  favicon: string;
}

// Create a parser instance with custom fields
const parser = new Parser<CustomFeed, CustomItem>({
  customFields: {
    item: [
      'content',
      'content:encoded',
      'media:content',
      'enclosure',
      'categories',
    ],
    feed: [
      'image',
      'favicon',
    ],
  },
});

/**
 * Parse an RSS feed URL and return the feed data
 */
export async function parseFeed(url: string) {
  try {
    const feed = await parser.parseURL(url);
    return feed;
  } catch (error) {
    console.error('Error parsing feed:', error);
    throw new Error(`Failed to parse feed: ${error}`);
  }
}

/**
 * Extract the best image URL from an RSS item
 */
export function extractImageUrl(item: CustomItem): string | undefined {
  // Try media:content first
  if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }
  
  // Try enclosure next
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  // Try to extract from content or content:encoded
  const contentToSearch = item['content:encoded'] || item.content || '';
  const imgMatch = contentToSearch.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  return undefined;
}

/**
 * Extract a summary from an RSS item
 */
export function extractSummary(item: CustomItem): string {
  // Use the description if available
  if (item.contentSnippet) {
    return item.contentSnippet;
  }
  
  // Otherwise, use the content and truncate it
  const content = item['content:encodedSnippet'] || item.contentSnippet || '';
  return content.length > 300 ? content.substring(0, 297) + '...' : content;
}

/**
 * Estimate reading time for an article
 */
export function estimateReadingTime(content: string): number {
  // Average reading speed: 200-250 words per minute
  const wordsPerMinute = 225;
  
  // Remove HTML tags and count words
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).length;
  
  // Calculate reading time in minutes
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  // Return at least 1 minute
  return Math.max(1, readingTime);
}

/**
 * Convert an RSS item to our Article format
 */
export function convertRssItemToArticle(item: CustomItem, feedId: string): Partial<Article> {
  const imageUrl = extractImageUrl(item);
  const summary = extractSummary(item);
  const content = item['content:encoded'] || item.content || '';
  const readTime = estimateReadingTime(content);
  
  return {
    feed_id: feedId,
    title: item.title || 'Untitled',
    url: item.link || '',
    author: item.creator || item.author || undefined,
    published_at: item.isoDate ? new Date(item.isoDate).toISOString() : new Date().toISOString(),
    content: content,
    summary: summary,
    image_url: imageUrl,
    categories: item.categories || [],
    read_time: readTime,
  };
}

/**
 * Format a date as a relative time string (e.g., "2d ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
}
