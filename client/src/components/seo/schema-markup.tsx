import { 
  generateOrganizationSchema, 
  generatePropertySchema, 
  generateBreadcrumbSchema 
} from '@/utils/structuredData';

// Organization Schema Component
interface OrganizationSchemaProps {
  name?: string;
  baseUrl: string;
  logoUrl: string;
  description?: string;
  email?: string;
  telephone?: string;
  address?: string;
  socialProfiles?: string[];
}

/**
 * OrganizationSchema - Component to add global organization schema for SEO
 */
export function OrganizationSchema({
  name = 'Inmobi Real Estate',
  baseUrl,
  logoUrl,
  description = 'Inmobi is a leading real estate platform connecting buyers, sellers, and renters with an AI-powered property search and recommendation system.',
  email = 'info@inmobi.mobi',
  telephone = '+34679680000',
  address = 'c. de la Ribera 14, 08003 Barcelona',
  socialProfiles = [
    'https://facebook.com/inmobirealestate',
    'https://twitter.com/inmobirealestate',
    'https://instagram.com/inmobirealestate',
    'https://linkedin.com/company/inmobirealestate'
  ]
}: OrganizationSchemaProps) {
  const schemaData = {
    name,
    url: baseUrl,
    logo: logoUrl,
    description,
    email,
    telephone,
    address,
    sameAs: socialProfiles
  };
  
  const schemaJson = generateOrganizationSchema(schemaData);
  
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
  );
}

// Property Schema Component
interface PropertySchemaProps {
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
 * PropertySchema - Component for adding property structured data
 */
export function PropertySchema({ property, baseUrl }: PropertySchemaProps) {
  const schemaJson = generatePropertySchema(property, baseUrl);
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
  );
}

// Breadcrumbs Schema Component
interface BreadcrumbsSchemaProps {
  breadcrumbs: Array<{ name: string; url: string }>;
}

/**
 * BreadcrumbsSchema - Component for adding breadcrumb structured data
 */
export function BreadcrumbsSchema({ breadcrumbs }: BreadcrumbsSchemaProps) {
  const schemaJson = generateBreadcrumbSchema(breadcrumbs);
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
  );
}

// List Schema Component for property listings
interface PropertyListSchemaProps {
  properties: Array<{
    id: string | number;
    title: string;
    price: number;
    location: string;
    imageUrl: string;
  }>;
  baseUrl: string;
}

/**
 * PropertyListSchema - Component for adding property list structured data
 */
export function PropertyListSchema({ properties, baseUrl }: PropertyListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': properties.map((property, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'RealEstateListing',
        'name': property.title,
        'url': `${baseUrl}/property/${property.id}`,
        'image': property.imageUrl,
        'offers': {
          '@type': 'Offer',
          'price': property.price,
          'priceCurrency': 'EUR'
        },
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': property.location
        }
      }
    }))
  };
  
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}