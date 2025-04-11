import { Helmet } from 'react-helmet';

/**
 * Component for comprehensive meta tag management
 * Handles standard meta tags, Open Graph, Twitter Cards, etc.
 */

interface MetaTagsProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile' | 'product';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

export function MetaTags({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  keywords,
  author,
  publishedTime,
  modifiedTime,
  noIndex = false,
}: MetaTagsProps) {
  // Default image if none provided
  const defaultOgImage = '/assets/default-og-image.jpg';
  
  // Base URL detection
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://inmobi.replit.app';
  
  // Format image URL to be absolute
  const formattedOgImage = ogImage 
    ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`)
    : `${baseUrl}${defaultOgImage}`;
    
  // Format canonical URL to be absolute if it's not already
  const formattedCanonicalUrl = canonicalUrl 
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${baseUrl}${canonicalUrl}`)
    : undefined;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      
      {/* Robots directive */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Keywords if provided */}
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Author if provided */}
      {author && <meta name="author" content={author} />}
      
      {/* Canonical URL */}
      {formattedCanonicalUrl && (
        <link rel="canonical" href={formattedCanonicalUrl} />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={formattedCanonicalUrl || baseUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={formattedOgImage} />
      <meta property="og:site_name" content="Inmobi Real Estate" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={formattedCanonicalUrl || baseUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={formattedOgImage} />
      <meta name="twitter:site" content="@inmobirealestate" />
      {author && <meta name="twitter:creator" content={author} />}

      {/* Apple specific */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Inmobi Real Estate" />

      {/* Windows Tiles */}
      <meta name="msapplication-TileColor" content="#1d2633" />
      <meta name="msapplication-TileImage" content="/assets/ms-icon-144x144.png" />
      <meta name="theme-color" content="#1d2633" />

      {/* Language and direction */}
      <html lang="en" dir="ltr" />
    </Helmet>
  );
}