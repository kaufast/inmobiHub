interface PropertyStructuredDataProps {
  id: string | number;
  name: string;
  description: string;
  price: number;
  priceCurrency?: string;
  url: string;
  image: string | string[];
  address: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  numberOfRooms?: number;
  floorSize?: {
    value: number;
    unitCode: 'MTK' | 'FTK' | 'SQM' | 'SQF';
  };
  propertyType?: 'Apartment' | 'House' | 'Condo' | 'SingleFamilyResidence' | 'Villa';
}

/**
 * Generate structured data for a real estate property listing
 * https://developers.google.com/search/docs/appearance/structured-data/house-listings
 */
export function generatePropertyStructuredData({
  id,
  name,
  description,
  price,
  priceCurrency = 'EUR',
  url,
  image,
  address,
  numberOfRooms,
  floorSize,
  propertyType = 'House',
}: PropertyStructuredDataProps) {
  // Format the property type with appropriate schema.org type
  const formattedPropertyType = `https://schema.org/${propertyType}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': formattedPropertyType,
    identifier: id.toString(),
    name,
    description,
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency,
    },
    url,
    image: typeof image === 'string' ? image : image,
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
    ...(numberOfRooms && { numberOfRooms }),
    ...(floorSize && { 
      floorSize: {
        '@type': 'QuantitativeValue',
        value: floorSize.value,
        unitCode: floorSize.unitCode,
      }
    }),
  };
}

/**
 * Generate structured data for a real estate organization
 */
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Inmobi®',
    url: 'https://inmobi.replit.app',
    logo: 'https://inmobi.replit.app/assets/logo.svg',
    description: 'A cutting-edge real estate platform leveraging AI technologies to transform property discovery',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'c. de la Ribera 14',
      addressLocality: 'Barcelona',
      postalCode: '08003',
      addressCountry: 'ES',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+34679680000',
      email: 'info@inmobi.mobi',
      contactType: 'customer service',
    },
    sameAs: [
      'https://www.facebook.com/inmobiofficial',
      'https://www.instagram.com/inmobiofficial',
      'https://twitter.com/inmobiofficial',
      'https://www.linkedin.com/company/inmobi-official'
    ],
  };
}

/**
 * Generate structured data for a real estate search results page
 */
export function generateSearchResultsStructuredData(
  properties: { url: string }[],
  searchQuery: string,
  totalResults: number
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: totalResults,
    itemListElement: properties.map((property, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: property.url,
    })),
    url: `https://inmobi.replit.app/search?q=${encodeURIComponent(searchQuery)}`,
  };
}