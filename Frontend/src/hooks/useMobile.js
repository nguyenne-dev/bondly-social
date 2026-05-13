import { useState, useEffect } from 'react';

/**
 * Hook to detect if current screen viewport is mobile (< 768px).
 * Automatically updates on window resize and cleans up listener.
 */
export const useMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

export default useMobile;
