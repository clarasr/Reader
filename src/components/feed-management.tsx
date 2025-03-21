import { useState } from 'react';
import { Plus, Folder, Trash, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FeedGroup {
  id: string;
  name: string;
}

interface Feed {
  id: string;
  title: string;
  url: string;
  groupId: string | null;
  favicon?: string;
}

interface FeedManagementProps {
  groups: FeedGroup[];
  feeds: Feed[];
  onAddGroup: (name: string) => Promise<void>;
  onEditGroup: (id: string, name: string) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onAddFeed: (url: string, groupId: string | null) => Promise<void>;
  onEditFeed: (id: string, updates: Partial<Feed>) => Promise<void>;
  onDeleteFeed: (id: string) => Promise<void>;
}

export default function FeedManagement({
  groups,
  feeds,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onAddFeed,
  onEditFeed,
  onDeleteFeed,
}: FeedManagementProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    
    try {
      await onAddGroup(newGroupName);
      setNewGroupName('');
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };
  
  const handleEditGroup = async (id: string) => {
    if (!editingGroupName.trim()) return;
    
    try {
      await onEditGroup(id, editingGroupName);
      setEditingGroupId(null);
    } catch (error) {
      console.error('Error editing group:', error);
    }
  };
  
  const handleAddFeed = async () => {
    if (!newFeedUrl.trim()) return;
    
    try {
      await onAddFeed(newFeedUrl, selectedGroupId);
      setNewFeedUrl('');
    } catch (error) {
      console.error('Error adding feed:', error);
    }
  };
  
  const startEditingGroup = (group: FeedGroup) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };
  
  const cancelEditingGroup = () => {
    setEditingGroupId(null);
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Feed Groups</h2>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Button onClick={handleAddGroup} className="w-full">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-2">
          {groups.map((group) => (
            <div key={group.id} className="glass-card p-3 flex items-center justify-between">
              {editingGroupId === group.id ? (
                <div className="flex-1 flex items-center space-x-2">
                  <Input
                    value={editingGroupName}
                    onChange={(e) => setEditingGroupName(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon" variant="ghost" onClick={() => handleEditGroup(group.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={cancelEditingGroup}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <Folder className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{group.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={() => setSelectedGroupId(group.id)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card">
                        <DialogHeader>
                          <DialogTitle>Add Feed to {group.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Input
                            placeholder="Feed URL"
                            value={newFeedUrl}
                            onChange={(e) => setNewFeedUrl(e.target.value)}
                          />
                          <Button onClick={handleAddFeed} className="w-full">
                            Add Feed
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button size="icon" variant="ghost" onClick={() => startEditingGroup(group)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onDeleteGroup(group.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Feeds</h2>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Feed
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Add New Feed</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Feed URL"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                />
                <select 
                  className="w-full p-2 rounded-md border border-input bg-background"
                  onChange={(e) => setSelectedGroupId(e.target.value === "" ? null : e.target.value)}
                >
                  <option value="">No Group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <Button onClick={handleAddFeed} className="w-full">
                  Add Feed
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-2">
          {feeds.map((feed) => (
            <div key={feed.id} className="glass-card p-3 flex items-center justify-between">
              <div className="flex items-center">
                {feed.favicon ? (
                  <img src={feed.favicon} alt="" className="h-5 w-5 mr-2" />
                ) : (
                  <div className="h-5 w-5 mr-2 bg-muted rounded-full" />
                )}
                <div>
                  <div>{feed.title}</div>
                  <div className="text-xs text-muted-foreground">{feed.url}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <select 
                  className="p-1 text-xs rounded-md border border-input bg-background"
                  value={feed.groupId || ""}
                  onChange={(e) => onEditFeed(feed.id, { 
                    groupId: e.target.value === "" ? null : e.target.value 
                  })}
                >
                  <option value="">No Group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onDeleteFeed(feed.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
