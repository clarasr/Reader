// A collection of real RSS feeds for testing
export const testFeeds = [
  {
    url: "https://news.ycombinator.com/rss",
    name: "Hacker News",
    description: "Top stories from Hacker News"
  },
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    name: "New York Times - Technology",
    description: "Technology news from The New York Times"
  },
  {
    url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    name: "Wall Street Journal - World News",
    description: "World news from The Wall Street Journal"
  },
  {
    url: "https://feeds.feedburner.com/TechCrunch/",
    name: "TechCrunch",
    description: "The latest technology news and information on startups"
  },
  {
    url: "https://www.wired.com/feed/rss",
    name: "Wired",
    description: "Latest technology news and articles from Wired"
  },
  {
    url: "https://www.reddit.com/r/programming/.rss",
    name: "Reddit - Programming",
    description: "Programming discussions and news from Reddit"
  },
  {
    url: "https://css-tricks.com/feed/",
    name: "CSS-Tricks",
    description: "Tips, tricks, and techniques on using CSS"
  },
  {
    url: "https://www.smashingmagazine.com/feed/",
    name: "Smashing Magazine",
    description: "Web design and development articles"
  },
  {
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    name: "BBC Technology",
    description: "Technology news from BBC"
  },
  {
    url: "https://www.theverge.com/rss/index.xml",
    name: "The Verge",
    description: "Technology, science, art, and culture news"
  }
];

// Function to load test feeds into the application
export async function loadTestFeeds(addFeedFunction: (url: string, name: string, description: string) => Promise<any>) {
  const results = [];
  
  for (const feed of testFeeds) {
    try {
      const result = await addFeedFunction(feed.url, feed.name, feed.description);
      results.push({
        feed,
        success: true,
        result
      });
    } catch (error) {
      results.push({
        feed,
        success: false,
        error
      });
    }
  }
  
  return results;
}
