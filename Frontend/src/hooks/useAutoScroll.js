import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Smart auto-scroll hook for chat messages list.
 * Only scrolls to bottom automatically if user is already near the bottom,
 * preventing sudden jumps when reading older messages.
 */
export const useAutoScroll = (dependencies = []) => {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const threshold = 120; // px from bottom
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsAtBottom(distanceToBottom <= threshold);
  }, []);

  // Auto-scroll on dependencies change (e.g. messages update, typing status)
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom('smooth');
    }
  }, dependencies);

  return {
    messagesEndRef,
    scrollContainerRef,
    isAtBottom,
    scrollToBottom,
    handleScroll,
  };
};

export default useAutoScroll;
