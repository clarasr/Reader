import { useState, useEffect, useRef } from 'react';

interface HighlightData {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  color: string;
  note?: string;
}

export default function useHighlighter(contentRef: React.RefObject<HTMLElement>) {
  const [highlights, setHighlights] = useState<HighlightData[]>([]);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const highlightColorsRef = useRef(['#ffeb3b', '#4caf50', '#2196f3', '#e91e63']);

  // Apply highlights to the DOM
  useEffect(() => {
    if (!contentRef.current || highlights.length === 0) return;

    // Clear existing highlights
    const existingHighlights = contentRef.current.querySelectorAll('.article-highlight');
    existingHighlights.forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ''), el);
        parent.normalize();
      }
    });

    // Apply new highlights
    highlights.forEach(highlight => {
      applyHighlight(highlight);
    });
  }, [highlights, contentRef]);

  // Create a new highlight from the current selection
  const createHighlight = (note?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed || !contentRef.current) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const content = contentRef.current;

    // Make sure the selection is within our content element
    if (!content.contains(range.commonAncestorContainer)) {
      return null;
    }

    // Get the text content of the selection
    const text = range.toString();
    if (!text.trim()) {
      return null;
    }

    // Create a new highlight
    const newHighlight: HighlightData = {
      id: crypto.randomUUID(),
      text,
      startOffset: getTextOffset(content, range.startContainer, range.startOffset),
      endOffset: getTextOffset(content, range.endContainer, range.endOffset),
      color: highlightColorsRef.current[highlights.length % highlightColorsRef.current.length],
      note
    };

    // Add the new highlight
    setHighlights(prev => [...prev, newHighlight]);
    
    // Clear the selection
    selection.removeAllRanges();

    return newHighlight;
  };

  // Remove a highlight
  const removeHighlight = (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
    if (activeHighlight === id) {
      setActiveHighlight(null);
    }
  };

  // Update a highlight's note
  const updateHighlightNote = (id: string, note: string) => {
    setHighlights(prev => 
      prev.map(h => h.id === id ? { ...h, note } : h)
    );
  };

  // Change a highlight's color
  const changeHighlightColor = (id: string, color: string) => {
    setHighlights(prev => 
      prev.map(h => h.id === id ? { ...h, color } : h)
    );
  };

  // Get all highlights
  const getHighlights = () => {
    return highlights;
  };

  // Set highlights (e.g., when loading from storage)
  const setAllHighlights = (newHighlights: HighlightData[]) => {
    setHighlights(newHighlights);
  };

  // Helper function to get text offset relative to the content element
  const getTextOffset = (
    root: Node, 
    targetNode: Node, 
    targetOffset: number
  ): number => {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );

    let offset = 0;
    let currentNode = walker.nextNode();

    while (currentNode) {
      if (currentNode === targetNode) {
        return offset + targetOffset;
      }

      offset += (currentNode.textContent || '').length;
      currentNode = walker.nextNode();
    }

    return offset;
  };

  // Helper function to apply a highlight to the DOM
  const applyHighlight = (highlight: HighlightData) => {
    if (!contentRef.current) return;

    const root = contentRef.current;
    const allText = root.textContent || '';
    
    // If the content has changed and our offsets are no longer valid, skip this highlight
    if (highlight.startOffset >= allText.length || highlight.endOffset > allText.length) {
      return;
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentOffset = 0;
    let startContainer: Node | null = null;
    let startOffset = 0;
    let endContainer: Node | null = null;
    let endOffset = 0;

    // Find the start and end containers and offsets
    let currentNode = walker.nextNode();
    while (currentNode) {
      const nodeLength = (currentNode.textContent || '').length;
      
      // Check if this node contains the start point
      if (startContainer === null && currentOffset + nodeLength > highlight.startOffset) {
        startContainer = currentNode;
        startOffset = highlight.startOffset - currentOffset;
      }
      
      // Check if this node contains the end point
      if (endContainer === null && currentOffset + nodeLength >= highlight.endOffset) {
        endContainer = currentNode;
        endOffset = highlight.endOffset - currentOffset;
        break;
      }
      
      currentOffset += nodeLength;
      currentNode = walker.nextNode();
    }

    // If we found valid start and end points, create the highlight
    if (startContainer && endContainer) {
      const range = document.createRange();
      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);
      
      // Create the highlight element
      const highlightEl = document.createElement('span');
      highlightEl.className = 'article-highlight';
      highlightEl.dataset.id = highlight.id;
      highlightEl.style.backgroundColor = highlight.color;
      highlightEl.style.cursor = 'pointer';
      
      // Add click handler to the highlight element
      highlightEl.addEventListener('click', () => {
        setActiveHighlight(highlight.id);
      });
      
      // Apply the highlight
      range.surroundContents(highlightEl);
    }
  };

  return {
    createHighlight,
    removeHighlight,
    updateHighlightNote,
    changeHighlightColor,
    getHighlights,
    setAllHighlights,
    activeHighlight,
    setActiveHighlight
  };
}
