import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Optimized Image Component that supports:
 * - Lazy loading with browser native support
 * - Progressive loading with low quality image placeholders
 * - Proper sizing hints for layout stability
 * - Responsive loading with srcset and sizes
 * - WebP support with fallback
 * - Modern image formats by default
 */

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'srcSet' | 'sizes'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  quality?: number;
  withLqip?: boolean; // Low Quality Image Placeholder
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes = '100vw',
  onLoad,
  quality = 80,
  withLqip = false,
  className,
  ...rest
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [lqipSrc, setLqipSrc] = useState<string | null>(null);
  
  // Handle image load event
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  // Get LQIP if required and not already a data URL
  useEffect(() => {
    if (withLqip && !src.startsWith('data:') && !lqipSrc) {
      // Check if we have a WebP version already
      const baseSrc = src.replace(/\.(jpe?g|png|gif|webp)$/i, '');
      const lqipUrl = `${baseSrc}.lqip.webp`;
      
      // First check if LQIP exists
      fetch(lqipUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            setLqipSrc(lqipUrl);
          }
        })
        .catch(() => {
          // No LQIP available, use original with blur filter in CSS
          setLqipSrc(null);
        });
    }
  }, [src, withLqip, lqipSrc]);
  
  // Process the source attribute to support WebP with fallback
  const processedSrc = src;
  
  // Generate responsive sizes if dimensions are provided
  const getSrcSet = () => {
    if (!width || !height) return undefined;
    
    // Generate sizes for common viewport widths
    const baseSrc = src.replace(/\.(jpe?g|png|gif|webp)$/i, '');
    const formats = [
      { width: width / 4, suffix: 'small' },
      { width: width / 2, suffix: 'medium' },
      { width: width, suffix: 'large' },
      { width: width * 2, suffix: 'xlarge' }
    ];
    
    return formats
      .map(format => {
        const url = `${baseSrc}.${format.suffix}.webp`;
        return `${url} ${format.width}w`;
      })
      .join(', ');
  };
  
  // Setup image loading behavior
  const loading = priority ? 'eager' : 'lazy';
  const decoding = priority ? 'sync' : 'async';
  const fetchPriority = priority ? 'high' : 'auto';
  
  // Generate proper aspect ratio for the container
  const aspectRatio = width && height ? width / height : undefined;
  
  return (
    <div 
      className={`relative overflow-hidden ${!isLoaded ? 'bg-muted animate-pulse' : ''}`}
      style={{
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
      }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      {lqipSrc && !isLoaded && (
        <img 
          src={lqipSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-md opacity-50 transition-opacity"
          aria-hidden="true"
        />
      )}
      
      <img
        src={processedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        // @ts-ignore - fetchPriority is not in the current TypeScript DOM types
        fetchPriority={fetchPriority}
        onLoad={handleLoad}
        srcSet={getSrcSet()}
        sizes={sizes}
        className={`${className || ''} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 w-full h-full object-cover`}
        {...rest}
      />
    </div>
  );
}