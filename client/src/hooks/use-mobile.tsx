import { useState, useEffect } from 'react';

export function useIsMobile(): boolean {
  // Set a default value to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Update state based on window width (default mobile breakpoint is 768px)
      setIsMobile(window.innerWidth < 768);
    }
    
    // Call handler right away to set initial state
    handleResize();
    
    // Set up event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}