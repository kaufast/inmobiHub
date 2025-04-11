import { Property } from '@shared/schema';
import { Helmet } from 'react-helmet';
import { formatDate } from '@/utils/format';

/**
 * Creates schema.org structured data for a property listing
 * Adds rich data for Google to enhance search results
 */

interface PropertySchemaProps {
  property: Property;
  baseUrl: string;
}

export function PropertySchema({ property, baseUrl }: PropertySchemaProps) {
  // Build full URLs for images
  const images = property.images?.map(image => 
    image.startsWith('http') ? image : `${baseUrl}${image}`
  ) || [];

  // Format availability
  const availability = property.status === 'active' ? 'InStock' : 'SoldOut';
  
  // Format price with currency
  const formattedPrice = property.price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
  
  // Determine the correct schema type based on property type
  // "House", "Apartment", "Condo", "SingleFamilyResidence", etc.
  let propertyType = 'House';
  switch (property.propertyType?.toLowerCase()) {
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
      addressCountry: property.country,
    },
    
    // Property details
    numberOfRooms: property.bedrooms + property.bathrooms,
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.squareFeet,
      unitCode: 'FTK', // ISO Standard for square feet
    },
    
    // Availability and pricing
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'USD',
      priceValidUntil: formatDate(new Date(new Date().setMonth(new Date().getMonth() + 3))), // Valid for 3 months
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
    datePosted: property.createdAt?.toISOString() || new Date().toISOString(),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(propertySchema)}
      </script>
    </Helmet>
  );
}