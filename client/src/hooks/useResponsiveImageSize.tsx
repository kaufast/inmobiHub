import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Define breakpoints that match Tailwind's breakpoints
const breakpointValues: Record<Breakpoint, number> = {
  'xs': 0,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536
};

/**
 * Hook that returns the current breakpoint based on window width
 */
export function useBreakpoint(): Breakpoint {
  // Default to xs for server-side rendering
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs');

  useEffect(() => {
    // Function to determine current breakpoint
    const determineBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= breakpointValues['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpointValues.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpointValues.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpointValues.md) {
        setBreakpoint('md');
      } else if (width >= breakpointValues.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    // Initial call
    determineBreakpoint();

    // Set up event listener
    window.addEventListener('resize', determineBreakpoint);

    // Clean up
    return () => {
      window.removeEventListener('resize', determineBreakpoint);
    };
  }, []);

  return breakpoint;
}

/**
 * Hook to get appropriate image dimension based on breakpoint
 * @param breakpointDimensions - Dimensions for different breakpoints
 * @param defaultDimension - Default dimension if no specific breakpoint dimension is found
 */
export function useResponsiveImageSize<T>(
  breakpointDimensions: Partial<Record<Breakpoint, T>>,
  defaultDimension: T
): T {
  const currentBreakpoint = useBreakpoint();
  
  // Find the closest matching breakpoint if exact match not found
  const findClosestBreakpoint = (): T => {
    // List of breakpoints in descending order
    const breakpoints: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    
    // Current breakpoint index
    const currentIndex = breakpoints.indexOf(currentBreakpoint);
    
    // Look for closest breakpoint with defined dimension
    for (let i = currentIndex; i < breakpoints.length; i++) {
      const bp = breakpoints[i];
      if (bp in breakpointDimensions) {
        return breakpointDimensions[bp] as T;
      }
    }
    
    // If no smaller breakpoint found, check larger breakpoints
    for (let i = currentIndex - 1; i >= 0; i--) {
      const bp = breakpoints[i];
      if (bp in breakpointDimensions) {
        return breakpointDimensions[bp] as T;
      }
    }
    
    // Fall back to default if no appropriate breakpoint found
    return defaultDimension;
  };
  
  // Return dimension for current breakpoint or fallback to closest/default
  return breakpointDimensions[currentBreakpoint] || findClosestBreakpoint();
}

/**
 * Helper function to create responsive image URL
 * @param baseUrl - Original image URL
 * @param width - Desired width
 * @param height - Desired height (optional)
 * @param format - Desired format (webp, jpg, etc.)
 */
export function getResponsiveImageUrl(
  baseUrl: string,
  width: number,
  height?: number,
  format: 'webp' | 'jpg' | 'png' | 'avif' = 'webp'
): string {
  // Skip processing for external URLs from secure domains
  const skipProcessingDomains = [
    'unsplash.com',
    'images.unsplash.com',
    'cloudinary.com',
    'res.cloudinary.com',
    'amazonaws.com',
    'imgix.net'
  ];
  
  // Check if URL is already from an optimized source
  if (skipProcessingDomains.some(domain => baseUrl.includes(domain))) {
    return baseUrl;
  }
  
  // Check if URL already has query parameters
  const hasParams = baseUrl.includes('?');
  const separator = hasParams ? '&' : '?';
  
  // Build query parameters
  let params = `width=${width}`;
  if (height) {
    params += `&height=${height}`;
  }
  
  // Add format if not already in that format
  if (!baseUrl.toLowerCase().endsWith(`.${format}`)) {
    params += `&format=${format}`;
  }
  
  return `${baseUrl}${separator}${params}`;
}