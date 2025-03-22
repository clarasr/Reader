"use client";
import { useState, useEffect } from 'react';
import { testFeeds, loadTestFeeds } from '@/lib/test-feeds';
import useFeedManager from '@/hooks/use-feed-manager';
import useArticleManager from '@/hooks/use-article-manager';

export default function TestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  
  const { addFeed, refreshFeeds } = useFeedManager();
  const { loadArticles } = useArticleManager();
  
  const runTests = async () => {
    setIsLoading(true);
    setTestStatus('running');
    setTestResults([]);
    
    try {
      // Test 1: Load test feeds
      setTestResults(prev => [...prev, { name: 'Loading test feeds', status: 'running' }]);
      const feedResults = await loadTestFeeds(async (url, name, description) => {
        return await addFeed(url, null, { name, description });
      });
      
      const successfulFeeds = feedResults.filter(r => r.success).length;
      setTestResults(prev => [
        ...prev.slice(0, -1),
        { 
          name: 'Loading test feeds', 
          status: successfulFeeds > 0 ? 'passed' : 'failed',
          details: `${successfulFeeds}/${feedResults.length} feeds loaded successfully`
        }
      ]);
      
      // Test 2: Refresh feeds
      setTestResults(prev => [...prev, { name: 'Refreshing feeds', status: 'running' }]);
      await refreshFeeds();
      setTestResults(prev => [
        ...prev.slice(0, -1),
        { name: 'Refreshing feeds', status: 'passed' }
      ]);
      
      // Test 3: Load articles
      setTestResults(prev => [...prev, { name: 'Loading articles', status: 'running' }]);
      const articles = await loadArticles();
      setTestResults(prev => [
        ...prev.slice(0, -1),
        { 
          name: 'Loading articles', 
          status: articles.length > 0 ? 'passed' : 'failed',
          details: `${articles.length} articles loaded`
        }
      ]);
      
      // Test 4: Test responsive layout
      setTestResults(prev => [...prev, { name: 'Responsive layout check', status: 'running' }]);
      const isResponsive = testResponsiveLayout();
      setTestResults(prev => [
        ...prev.slice(0, -1),
        { 
          name: 'Responsive layout check', 
          status: isResponsive ? 'passed' : 'failed'
        }
      ]);
      
      // Test 5: Performance check
      setTestResults(prev => [...prev, { name: 'Performance check', status: 'running' }]);
      const performanceResult = await testPerformance();
      setTestResults(prev => [
        ...prev.slice(0, -1),
        { 
          name: 'Performance check', 
          status: performanceResult.score > 80 ? 'passed' : 'warning',
          details: `Score: ${performanceResult.score}/100, Load time: ${performanceResult.loadTime}ms`
        }
      ]);
      
      // Overall test status
      const failedTests = testResults.filter(t => t.status === 'failed').length;
      setTestStatus(failedTests === 0 ? 'completed' : 'failed');
      
    } catch (error) {
      console.error('Test error:', error);
      setTestStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test responsive layout
  const testResponsiveLayout = () => {
    // In a real implementation, this would use more sophisticated checks
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Check if mobile navigation is shown at small widths
    const isMobileView = viewportWidth < 768;
    const mobileNavVisible = isMobileView && document.querySelector('.glass-bottom-nav') !== null;
    const desktopNavHidden = isMobileView && document.querySelector('.glass-nav')?.classList.contains('md:flex');
    
    return mobileNavVisible && desktopNavHidden;
  };
  
  // Test performance
  const testPerformance = async () => {
    return new Promise<{score: number, loadTime: number}>(resolve => {
      // In a real implementation, this would use the Performance API
      const startTime = performance.now();
      
      // Simulate loading and measuring performance
      setTimeout(() => {
        const endTime = performance.now();
        const loadTime = Math.round(endTime - startTime);
        
        // Calculate a score based on load time (just an example)
        const score = Math.max(0, 100 - (loadTime / 10));
        
        resolve({ score, loadTime });
      }, 1000);
    });
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">RSS Reader App Testing</h1>
      
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>
      
      {testStatus !== 'idle' && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Test Results</h2>
          <div className="space-y-2">
            {testResults.map((test, index) => (
              <div key={index} className="p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{test.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.status === 'passed' ? 'bg-green-100 text-green-800' :
                    test.status === 'failed' ? 'bg-red-100 text-red-800' :
                    test.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {test.status.toUpperCase()}
                  </span>
                </div>
                {test.details && (
                  <p className="text-sm text-muted-foreground mt-2">{test.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Available Test Feeds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testFeeds.map((feed, index) => (
            <div key={index} className="p-4 border rounded-md">
              <h3 className="font-medium">{feed.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{feed.description}</p>
              <p className="text-xs text-muted-foreground truncate">{feed.url}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
