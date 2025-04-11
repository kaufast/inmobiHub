import { Helmet } from 'react-helmet';
import { generatePropertySchema, generateBreadcrumbSchema } from '@/utils/structuredData';

interface PropertySEOProps {
  property: {
    id: string | number;
    title: string;
    description: string;
    price: number;
    currency?: string;
    bedrooms: number;
    bathrooms: number;
    squareMeters: number;
    location: string;
    imageUrl: string;
    status?: 'ForRent' | 'ForSale' | 'SaleUnderContract' | 'Sold';
    additionalImages?: string[];
    yearBuilt?: number;
    agent?: {
      name: string;
      email?: string;
      telephone?: string;
      image?: string;
    };
  };
  baseUrl: string;
}

/**
 * PropertySEO component for optimizing property detail pages for search engines
 * Adds appropriate meta tags and structured data
 */
export default function PropertySEO({ property, baseUrl }: PropertySEOProps) {
  // Generate breadcrumb data
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Properties', url: `${baseUrl}/search` },
    { name: property.title, url: `${baseUrl}/property/${property.id}` }
  ];
  
  // Format price with currency
  const formattedPrice = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: property.currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(property.price);
  
  // Create meta description
  const metaDescription = `${property.title} - ${formattedPrice}. ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.squareMeters}m². Located in ${property.location}. ${property.description.substring(0, 100)}...`;
  
  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{`${property.title} | ${formattedPrice} | Inmobi`}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph tags for social sharing */}
      <meta property="og:title" content={`${property.title} | ${formattedPrice}`} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={property.imageUrl} />
      <meta property="og:url" content={`${baseUrl}/property/${property.id}`} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${property.title} | ${formattedPrice}`} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={property.imageUrl} />
      
      {/* Canonical URL to prevent duplicate content issues */}
      <link rel="canonical" href={`${baseUrl}/property/${property.id}`} />
      
      {/* Add JSON-LD structured data */}
      <script type="application/ld+json">
        {generatePropertySchema(property, baseUrl)}
      </script>
      
      {/* Add breadcrumb structured data */}
      <script type="application/ld+json">
        {generateBreadcrumbSchema(breadcrumbItems)}
      </script>
    </Helmet>
  );
}