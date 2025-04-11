import { Helmet } from 'react-helmet';
import { generateBreadcrumbSchema } from '@/utils/structuredData';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  breadcrumbs?: Array<{ name: string; url: string }>;
  jsonLd?: string;
  noIndex?: boolean;
  keywords?: string[];
  children?: React.ReactNode;
}

/**
 * SEOHead - Reusable component for adding SEO metadata and schema markup to pages
 */
export default function SEOHead({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  twitterCard = 'summary_large_image',
  breadcrumbs,
  jsonLd,
  noIndex = false,
  keywords,
  children
}: SEOHeadProps) {
  // Get the baseUrl to use for canonical URLs
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // If canonicalUrl is provided without a domain, add baseUrl
  const fullCanonicalUrl = canonicalUrl 
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${baseUrl}${canonicalUrl}`)
    : '';
  
  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Canonical URL */}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Robots control */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Keywords if provided */}
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Open Graph meta tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {fullCanonicalUrl && <meta property="og:url" content={fullCanonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Breadcrumb schema if provided */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {generateBreadcrumbSchema(breadcrumbs)}
        </script>
      )}
      
      {/* Custom JSON-LD if provided */}
      {jsonLd && (
        <script type="application/ld+json">
          {jsonLd}
        </script>
      )}
      
      {/* Additional nested elements */}
      {children}
    </Helmet>
  );
}