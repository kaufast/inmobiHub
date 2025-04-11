import { Helmet } from 'react-helmet';
import { MetaTags } from '@/components/seo/meta-tags';
import { PropertySchema } from '@/components/seo/property-schema';
import { Property } from '@shared/schema';
import { 
  generateWebPageStructuredData, 
  generateOrganizationStructuredData,
  generateBreadcrumbStructuredData
} from '@/utils/structuredData';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string; // Path without domain, e.g. "/properties/123"
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile' | 'product';
  keywords?: string[];
  author?: string; 
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  property?: Property; // For property specific schema
  breadcrumbs?: Array<{ name: string; path: string }>;
  children?: React.ReactNode; // For additional custom meta tags
}

/**
 * A comprehensive SEO component that combines meta tags and structured data
 * Use this component on all key pages to ensure proper SEO
 */
export function SEOHead({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = 'website',
  keywords,
  author,
  publishedTime,
  modifiedTime,
  noIndex,
  property,
  breadcrumbs,
  children
}: SEOHeadProps) {
  // Get the base URL dynamically
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://inmobi.replit.app';
  
  // Format the canonical URL
  const canonicalUrl = canonicalPath ? `${baseUrl}${canonicalPath}` : undefined;
  
  // Company data for organization structured data
  const companyData = {
    name: 'Inmobi Real Estate',
    logo: `${baseUrl}/assets/logo.png`,
    url: baseUrl,
    sameAs: [
      'https://facebook.com/inmobirealestate',
      'https://twitter.com/inmobirealestate',
      'https://instagram.com/inmobirealestate',
      'https://linkedin.com/company/inmobirealestate',
    ],
    address: {
      streetAddress: 'c. de la Ribera 14',
      addressLocality: 'Barcelona',
      addressRegion: 'Catalonia',
      postalCode: '08003',
      addressCountry: 'Spain',
    },
    contactPoint: {
      telephone: '+34679680000',
      email: 'info@inmobi.mobi',
      contactType: 'Customer Support',
      availableLanguage: ['English', 'Spanish'],
    },
  };
  
  // Process breadcrumbs for structured data if provided
  const breadcrumbItems = breadcrumbs?.map(item => ({
    name: item.name,
    url: `${baseUrl}${item.path}`
  }));

  return (
    <>
      {/* Meta tags for standard SEO */}
      <MetaTags
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        ogImage={ogImage}
        ogType={ogType}
        keywords={keywords}
        author={author}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
        noIndex={noIndex}
      />
      
      {/* Structured data for enhanced search results */}
      <Helmet>
        {/* Basic webpage structured data */}
        <script type="application/ld+json">
          {generateWebPageStructuredData({
            title,
            description,
            url: canonicalUrl || baseUrl,
            image: ogImage,
            datePublished: publishedTime,
            dateModified: modifiedTime || publishedTime,
          })}
        </script>
        
        {/* Organization structured data */}
        <script type="application/ld+json">
          {generateOrganizationStructuredData(companyData)}
        </script>
        
        {/* Property schema if a property is provided */}
        {property && <PropertySchema property={property} baseUrl={baseUrl} />}
        
        {/* Breadcrumbs structured data */}
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <script type="application/ld+json">
            {generateBreadcrumbStructuredData(breadcrumbItems)}
          </script>
        )}
        
        {/* Allow for additional custom head elements */}
        {children}
      </Helmet>
    </>
  );
}