import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';

interface FeedGroup {
  id: string;
  name: string;
}

interface Feed {
  id: string;
  title: string;
  groupId: string | null;
}

interface ForYouHeaderProps {
  totalArticles: number;
  readArticles: number;
  groups: FeedGroup[];
  feeds: Feed[];
  selectedGroupId: string | null;
  selectedFeedId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onSelectFeed: (feedId: string | null) => void;
}

export default function ForYouHeader({
  totalArticles,
  readArticles,
  groups,
  feeds,
  selectedGroupId,
  selectedFeedId,
  onSelectGroup,
  onSelectFeed
}: ForYouHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const progress = totalArticles > 0 
    ? Math.round((readArticles / totalArticles) * 100) 
    : 0;
  
  const unreadCount = totalArticles - readArticles;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would be implemented here
  };
  
  return (
    <div className="p-4 pt-20 md:pt-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Your Feed</h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread articles
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            <DropdownMenuLabel>Filter by Group</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedGroupId === null && selectedFeedId === null}
              onCheckedChange={() => {
                onSelectGroup(null);
                onSelectFeed(null);
              }}
            >
              All Groups
            </DropdownMenuCheckboxItem>
            {groups.map((group) => (
              <DropdownMenuCheckboxItem
                key={group.id}
                checked={selectedGroupId === group.id}
                onCheckedChange={() => {
                  onSelectGroup(group.id);
                  onSelectFeed(null);
                }}
              >
                {group.name}
              </DropdownMenuCheckboxItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Feed</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {feeds
              .filter(feed => !selectedGroupId || feed.groupId === selectedGroupId)
              .map((feed) => (
                <DropdownMenuCheckboxItem
                  key={feed.id}
                  checked={selectedFeedId === feed.id}
                  onCheckedChange={() => onSelectFeed(feed.id)}
                >
                  {feed.title}
                </DropdownMenuCheckboxItem>
              ))
            }
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Reading Progress</span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
