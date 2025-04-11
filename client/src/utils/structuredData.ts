/**
 * Generates JSON-LD structured data for webpages
 * Improves search engine understanding of page content
 */

interface Organization {
  name: string;
  logo: string;
  url: string;
  sameAs?: string[];
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
    areaServed?: string;
    availableLanguage?: string[];
  };
}

interface WebPageData {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

/**
 * Creates JSON-LD structured data for a webpage
 * @param data Webpage data
 * @returns JSON-LD string for use in script tag
 */
export function generateWebPageStructuredData(data: WebPageData): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.title,
    description: data.description,
    url: data.url,
    ...(data.image && { image: data.image }),
    ...(data.datePublished && { datePublished: data.datePublished }),
    ...(data.dateModified && { dateModified: data.dateModified }),
  };

  return JSON.stringify(structuredData);
}

/**
 * Creates JSON-LD structured data for a property listing
 * @param property Property data
 * @param baseUrl Base URL of the website
 * @returns JSON-LD string for use in script tag
 */
export function generatePropertySchema(
  property: any,
  baseUrl: string
): string {
  // Build full URLs for images
  const images = property.images?.map((image: string) => 
    image.startsWith('http') ? image : `${baseUrl}${image}`
  ) || [];
  
  // Format availability
  const availability = property.status === 'active' ? 'InStock' : 'SoldOut';
  
  // Determine the correct schema type based on property type
  let propertyType = 'House';
  switch ((property.propertyType || '').toLowerCase()) {
    case 'apartment':
      propertyType = 'Apartment';
      break;
    case 'condo':
      propertyType = 'Apartment'; // Schema.org doesn't have a Condo type
      break;
    case 'townhouse':
      propertyType = 'House';
      break;
    case 'land':
      propertyType = 'LandProperty';
      break;
    default:
      propertyType = 'House';
  }
  
  // Create the schema
  const propertySchema = {
    '@context': 'https://schema.org',
    '@type': propertyType,
    name: property.title,
    description: property.description,
    url: `${baseUrl}/property/${property.id}`,
    identifier: property.id.toString(),
    ...(images.length > 0 && { image: images.length === 1 ? images[0] : images }),
    
    // Geo coordinates
    geo: {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    },
    
    // Address
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
      postalCode: property.zipCode,
      addressCountry: property.country || 'US',
    },
    
    // Property details
    numberOfRooms: (property.bedrooms || 0) + (property.bathrooms || 0),
    numberOfBedrooms: property.bedrooms || 0,
    numberOfBathroomsTotal: property.bathrooms || 0,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.squareFeet || property.squareMeters || 0,
      unitCode: property.squareFeet ? 'FTK' : 'MTK', // ISO Standard for square feet or meters
    },
    
    // Availability and pricing
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency || 'USD',
      priceValidUntil: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(), // Valid for 3 months
      availability: `https://schema.org/${availability}`,
    },
    
    // Add publisher/author info (the real estate agency)
    provider: {
      '@type': 'RealEstateAgent',
      name: 'Inmobi Real Estate',
      image: `${baseUrl}/assets/logo.png`,
      url: baseUrl,
      telephone: '+34679680000',
      priceRange: '$$$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'c. de la Ribera 14',
        addressLocality: 'Barcelona',
        addressRegion: 'Catalonia',
        postalCode: '08003',
        addressCountry: 'Spain',
      },
    },
    
    // Add listing date
    datePosted: property.createdAt instanceof Date ? property.createdAt.toISOString() : new Date().toISOString(),
  };

  return JSON.stringify(propertySchema);
}

/**
 * Creates JSON-LD structured data for the organization
 * @param org Organization data
 * @returns JSON-LD string for use in script tag
 */
export function generateOrganizationSchema(org: Organization): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: org.name,
    logo: org.logo,
    url: org.url,
    ...(org.sameAs && { sameAs: org.sameAs }),
    ...(org.address && {
      address: {
        '@type': 'PostalAddress',
        ...org.address,
      },
    }),
    ...(org.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...org.contactPoint,
      },
    }),
  };

  return JSON.stringify(structuredData);
}

/**
 * Creates JSON-LD structured data for breadcrumbs
 * @param items Array of breadcrumb items with name and url
 * @returns JSON-LD string for use in script tag
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(structuredData);
}

/**
 * Creates JSON-LD structured data for FAQ pages
 * @param questions Array of questions and answers
 * @returns JSON-LD string for use in script tag 
 */
export function generateFaqStructuredData(
  questions: Array<{ question: string; answer: string }>
): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return JSON.stringify(structuredData);
}