"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import MobileNavbar from '@/components/mobile-navbar';
import FeedManagement from '@/components/feed-management';
import useFeedManager from '@/hooks/use-feed-manager';

export default function ManagePage() {
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined);
  
  const { 
    feeds, 
    groups, 
    isLoading, 
    error,
    addFeed,
    addGroup,
    refreshFeeds,
    loadFeedsAndGroups
  } = useFeedManager();
  
  // Set a random background image
  useEffect(() => {
    // This would ideally come from a collection of background images or from feed favicons
    setBackgroundImage('/background.jpg');
  }, []);
  
  const handleAddFeed = async (url: string, groupId: string | null) => {
    try {
      await addFeed(url, groupId);
      return true;
    } catch (error) {
      console.error('Error adding feed:', error);
      return false;
    }
  };
  
  const handleAddGroup = async (name: string) => {
    try {
      await addGroup(name);
      return true;
    } catch (error) {
      console.error('Error adding group:', error);
      return false;
    }
  };
  
  const handleEditGroup = async (id: string, name: string) => {
    try {
      // This would call the API to update the group name
      // For now, we'll just reload the feeds and groups
      await loadFeedsAndGroups();
      return true;
    } catch (error) {
      console.error('Error editing group:', error);
      return false;
    }
  };
  
  const handleDeleteGroup = async (id: string) => {
    try {
      // This would call the API to delete the group
      // For now, we'll just reload the feeds and groups
      await loadFeedsAndGroups();
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  };
  
  const handleEditFeed = async (id: string, updates: any) => {
    try {
      // This would call the API to update the feed
      // For now, we'll just reload the feeds and groups
      await loadFeedsAndGroups();
      return true;
    } catch (error) {
      console.error('Error editing feed:', error);
      return false;
    }
  };
  
  const handleDeleteFeed = async (id: string) => {
    try {
      // This would call the API to delete the feed
      // For now, we'll just reload the feeds and groups
      await loadFeedsAndGroups();
      return true;
    } catch (error) {
      console.error('Error deleting feed:', error);
      return false;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Blurred background */}
      {backgroundImage && (
        <div className="blurred-bg">
          <img src={backgroundImage} alt="" />
        </div>
      )}
      
      <Navbar currentPage="manage" backgroundImage={backgroundImage} />
      
      <div className="pt-20 md:pt-24 pb-20">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading feeds...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-2">Error loading feeds</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => loadFeedsAndGroups()}
            >
              Retry
            </button>
          </div>
        ) : (
          <FeedManagement
            groups={groups}
            feeds={feeds.map(feed => ({
              id: feed.id,
              title: feed.title,
              url: feed.url,
              groupId: feed.group_id,
              favicon: feed.favicon
            }))}
            onAddGroup={handleAddGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onAddFeed={handleAddFeed}
            onEditFeed={handleEditFeed}
            onDeleteFeed={handleDeleteFeed}
          />
        )}
      </div>
      
      <MobileNavbar currentPage="manage" backgroundImage={backgroundImage} />
    </div>
  );
}
