import React from 'react';
import { Property, Neighborhood } from '@shared/schema';

interface JsonLdProps {
  data: Record<string, any>;
}

// Generic JsonLd component for any schema
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}

// Property (RealEstateListing) schema markup
export interface PropertySchemaProps {
  property: Property;
  neighborhood?: Neighborhood;
  baseUrl: string;
}

export function PropertySchema({ property, neighborhood, baseUrl }: PropertySchemaProps) {
  const fullUrl = `${baseUrl}/property/${property.id}`;
  
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': fullUrl,
    'url': fullUrl,
    'name': property.title,
    'description': property.description,
    'datePosted': property.createdAt,
    'mainEntityOfPage': fullUrl,
    'image': property.images.map(img => img),
    'price': `$${property.price.toLocaleString()}`,
    'priceCurrency': 'USD',
    'offerCount': 1,
    'offers': {
      '@type': 'Offer',
      'price': property.price,
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock'
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': property.address,
      'addressLocality': property.city,
      'addressRegion': property.state,
      'postalCode': property.zipCode,
      'addressCountry': property.country
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': property.latitude,
      'longitude': property.longitude
    },
    'numberOfBedrooms': property.bedrooms,
    'numberOfBathrooms': property.bathrooms,
    'floorSize': {
      '@type': 'QuantitativeValue',
      'value': property.squareFeet,
      'unitCode': 'SQFT',
      'unitText': 'Square Feet'
    },
    'propertyType': getPropertyType(property.propertyType),
    'yearBuilt': property.yearBuilt
  };

  return <JsonLd data={schemaData} />;
}

// Property Search Results schema markup
export interface PropertyListSchemaProps {
  properties: Property[];
  baseUrl: string;
}

export function PropertyListSchema({ properties, baseUrl }: PropertyListSchemaProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': properties.map((property, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'RealEstateListing',
        'name': property.title,
        'url': `${baseUrl}/property/${property.id}`,
        'image': property.images[0],
        'description': property.description,
        'offers': {
          '@type': 'Offer',
          'price': property.price,
          'priceCurrency': 'USD'
        },
        'numberOfBedrooms': property.bedrooms,
        'numberOfBathrooms': property.bathrooms,
        'floorSize': {
          '@type': 'QuantitativeValue',
          'value': property.squareFeet,
          'unitCode': 'SQFT'
        },
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': property.city,
          'addressRegion': property.state,
          'postalCode': property.zipCode,
          'addressCountry': property.country
        }
      }
    }))
  };

  return <JsonLd data={schemaData} />;
}

// Organization schema markup
export interface OrganizationSchemaProps {
  baseUrl: string;
  logoUrl: string;
  name?: string;
}

export function OrganizationSchema({ baseUrl, logoUrl, name = 'Inmobi' }: OrganizationSchemaProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': baseUrl,
    'name': name,
    'url': baseUrl,
    'logo': logoUrl,
    'sameAs': [
      'https://www.facebook.com/foundation',
      'https://www.twitter.com/foundation',
      'https://www.instagram.com/foundation',
      'https://www.linkedin.com/company/foundation'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+1-555-123-4567',
      'contactType': 'customer service',
      'availableLanguage': ['English', 'Spanish']
    }
  };

  return <JsonLd data={schemaData} />;
}

// Neighborhood schema markup
export interface NeighborhoodSchemaProps {
  neighborhood: Neighborhood;
  baseUrl: string;
}

export function NeighborhoodSchema({ neighborhood, baseUrl }: NeighborhoodSchemaProps) {
  const fullUrl = `${baseUrl}/neighborhood/${neighborhood.id}`;
  
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    '@id': fullUrl,
    'name': `${neighborhood.name} Neighborhood`,
    'description': neighborhood.description,
    'url': fullUrl,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': neighborhood.city,
      'addressRegion': neighborhood.state,
      'postalCode': neighborhood.zipCode,
      'addressCountry': 'USA'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': neighborhood.latitude,
      'longitude': neighborhood.longitude
    }
  };

  return <JsonLd data={schemaData} />;
}

// Breadcrumbs schema markup
export interface BreadcrumbsSchemaProps {
  items: {
    name: string;
    url: string;
  }[];
  baseUrl: string;
}

export function BreadcrumbsSchema({ items, baseUrl }: BreadcrumbsSchemaProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };

  return <JsonLd data={schemaData} />;
}

// Helper function to map property types to schema.org types
function getPropertyType(type: string): string {
  const mapping: Record<string, string> = {
    'house': 'SingleFamilyResidence',
    'condo': 'Apartment',
    'apartment': 'Apartment',
    'townhouse': 'Residence',
    'land': 'LandForm'
  };
  
  return mapping[type] || 'Residence';
}