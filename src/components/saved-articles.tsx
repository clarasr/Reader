import { useState } from 'react';
import { Bookmark, Search, Filter, Clock, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface SavedArticle {
  id: string;
  title: string;
  feed: {
    title: string;
  };
  author?: string;
  publishedAt: Date;
  summary?: string;
  imageUrl?: string;
  readTime?: number;
  tags?: string[];
  isFavorite: boolean;
}

interface SavedArticlesProps {
  articles: SavedArticle[];
  onOpenArticle: (articleId: string) => void;
  onToggleFavorite: (articleId: string) => void;
}

export default function SavedArticles({
  articles,
  onOpenArticle,
  onToggleFavorite
}: SavedArticlesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Get all unique tags from articles
  const allTags = Array.from(
    new Set(
      articles
        .flatMap(article => article.tags || [])
        .filter(Boolean)
    )
  );
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  const filteredArticles = articles.filter(article => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.feed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'favorites' && article.isFavorite);
    
    // Filter by tags
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.some(tag => article.tags?.includes(tag));
    
    return matchesSearch && matchesTab && matchesTags;
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the filter above
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  return (
    <div className="p-4 pt-20 md:pt-24 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Saved Articles</h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved articles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>
      
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Saved</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-8">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No saved articles</h3>
            <p className="text-muted-foreground">
              Articles you save will appear here
            </p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div 
              key={article.id} 
              className="glass-card p-4 cursor-pointer"
              onClick={() => onOpenArticle(article.id)}
            >
              <div className="flex gap-4">
                {article.imageUrl && (
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                    <img 
                      src={article.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {article.feed.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(article.id);
                      }}
                    >
                      <Bookmark 
                        className="h-4 w-4" 
                        fill={article.isFavorite ? "currentColor" : "none"} 
                      />
                    </Button>
                  </div>
                  
                  <h3 className="font-medium text-base line-clamp-2 mb-1">
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    {article.author && (
                      <span className="mr-2">{article.author}</span>
                    )}
                    <span>{formatDate(article.publishedAt)}</span>
                    {article.readTime && (
                      <span className="flex items-center ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {article.readTime} min
                      </span>
                    )}
                  </div>
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {article.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
