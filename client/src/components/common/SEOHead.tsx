import { Helmet } from 'react-helmet';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: object;
  noIndex?: boolean;
}

export default function SEOHead({
  title,
  description,
  canonicalUrl,
  ogImage = '/assets/og-default.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noIndex = false,
}: SEOHeadProps) {
  const siteName = 'Inmobi®';
  const fullTitle = `${title} | ${siteName}`;
  const domain = 'https://inmobi.replit.app';
  const fullCanonicalUrl = canonicalUrl ? `${domain}${canonicalUrl}` : undefined;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${domain}${ogImage}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Canonical URL */}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* OpenGraph Tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {fullOgImage && <meta property="og:image" content={fullOgImage} />}
      {fullCanonicalUrl && <meta property="og:url" content={fullCanonicalUrl} />}
      
      {/* Twitter Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {fullOgImage && <meta name="twitter:image" content={fullOgImage} />}
      
      {/* No Index (if needed) */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}