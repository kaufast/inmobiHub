import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useResponsiveImageSize, getResponsiveImageUrl } from '@/hooks/useResponsiveImageSize';

interface OptimizedPropertyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

/**
 * OptimizedPropertyImage component that:
 * 1. Shows a skeleton placeholder while loading
 * 2. Uses native lazy loading for non-priority images
 * 3. Sets proper width and height attributes for better CLS
 * 4. Implements progressive loading with blur-up effect
 * 5. Uses responsive images based on screen size
 * 6. Automatically serves WebP images if supported
 */
export default function OptimizedPropertyImage({
  src,
  alt,
  width = 400,
  height = 300,
  priority = false,
  className = '',
  sizes = '(min-width: 1280px) 400px, (min-width: 768px) 350px, 300px'
}: OptimizedPropertyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Get responsive image size based on breakpoint
  const responsiveWidth = useResponsiveImageSize({
    'xs': 300,
    'sm': 300,
    'md': 350,
    'lg': 350,
    'xl': 400,
    '2xl': 500
  }, 400);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setError(false);
  }, [src]);

  // Check WebP support
  const supportsWebp = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      return document.createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0;
    } catch (e) {
      return false;
    }
  }, []);

  // Generate image URLs
  const imageFormat = supportsWebp ? 'webp' : 'jpg';
  
  // Generate responsive image URL with WebP if supported
  const optimizedSrc = useMemo(() => 
    getResponsiveImageUrl(src, responsiveWidth, undefined, imageFormat),
  [src, responsiveWidth, imageFormat]);

  // Generate smaller thumbnail for low-quality image placeholder (LQIP)
  const thumbnailSrc = useMemo(() => 
    getResponsiveImageUrl(src, 50, undefined, imageFormat),
  [src, imageFormat]);

  // Generate srcSet for responsive images
  const srcSet = useMemo(() => {
    const widths = [300, 400, 600, 800, 1200, 1600];
    return widths
      .map(w => `${getResponsiveImageUrl(src, w, undefined, imageFormat)} ${w}w`)
      .join(', ');
  }, [src, imageFormat]);

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {/* Skeleton loader while image is loading */}
      {!isLoaded && !error && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}
      
      {/* Low quality image placeholder (blurred) */}
      {!error && (
        <img 
          src={thumbnailSrc}
          alt="" 
          aria-hidden="true" 
          className={`absolute inset-0 w-full h-full object-cover filter blur-lg transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
          width={width}
          height={height}
        />
      )}
      
      {/* Main image with srcSet for responsive loading */}
      {!error ? (
        <img 
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt} 
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : (
        // Fallback for failed image loads
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400 text-sm">
          <span>Image unavailable</span>
        </div>
      )}
    </div>
  );
}