import React from 'react';
import { Helmet } from 'react-helmet';

interface MetaTagsProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'product';
  locale?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterUsername?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  children?: React.ReactNode;
  keywords?: string[];
}

export default function MetaTags({
  title,
  description,
  canonical,
  image,
  type = 'website',
  locale = 'en_US',
  twitterCard = 'summary_large_image',
  twitterUsername = '@foundation',
  noIndex = false,
  noFollow = false,
  children,
  keywords = [],
}: MetaTagsProps) {
  const robots = `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="robots" content={robots} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {canonical && <meta property="og:url" content={canonical} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Inmobi" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterUsername} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Additional Tags */}
      {children}
    </Helmet>
  );
}

// Specialized Real Estate Meta Tags
interface PropertyMetaTagsProps extends Omit<MetaTagsProps, 'title' | 'description' | 'type'> {
  property: {
    title: string;
    description: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    address: string;
    city: string;
    state: string;
    image?: string;
  };
  baseUrl: string;
  propertyId: number;
}

export function PropertyMetaTags({
  property,
  baseUrl,
  propertyId,
  canonical = '',
  image = '',
  locale = 'en_US',
  twitterCard = 'summary_large_image',
  twitterUsername = '@foundation',
  noIndex = false,
  noFollow = false,
  children,
  keywords = [],
}: PropertyMetaTagsProps) {
  const fullTitle = `${property.title} | ${property.bedrooms} bed, ${property.bathrooms} bath | $${property.price.toLocaleString()}`;
  const fullDescription = `${property.description.slice(0, 150)}... ${property.squareFeet.toLocaleString()} sq ft home in ${property.city}, ${property.state}.`;
  const actualCanonical = canonical || `${baseUrl}/property/${propertyId}`;
  const propertyImage = image || property.image;
  
  const propertyKeywords = [
    ...keywords,
    'real estate',
    'property',
    `${property.bedrooms} bedroom`,
    `${property.city} real estate`,
    `${property.state} homes`,
    `${property.squareFeet} sq ft`,
    'for sale'
  ];
  
  return (
    <MetaTags
      title={fullTitle}
      description={fullDescription}
      canonical={actualCanonical}
      image={propertyImage}
      type="product"
      locale={locale}
      twitterCard={twitterCard}
      twitterUsername={twitterUsername}
      noIndex={noIndex}
      noFollow={noFollow}
      keywords={propertyKeywords}
    >
      {/* Property-specific meta tags */}
      <meta property="product:price:amount" content={property.price.toString()} />
      <meta property="product:price:currency" content="USD" />
      <meta property="product:category" content="Real Estate" />
      <meta property="product:availability" content="in stock" />
      <meta property="product:condition" content="new" />
      
      {children}
    </MetaTags>
  );
}

// Search Results Meta Tags
interface SearchMetaTagsProps extends Omit<MetaTagsProps, 'title' | 'description'> {
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  baseUrl: string;
  count: number;
}

export function SearchMetaTags({
  location,
  propertyType,
  minPrice,
  maxPrice,
  bedrooms,
  baseUrl,
  count,
  canonical = '',
  image,
  locale = 'en_US',
  twitterCard = 'summary',
  twitterUsername = '@foundation',
  noIndex = false,
  noFollow = false,
  children,
  keywords = [],
}: SearchMetaTagsProps) {
  let title = 'Property Search Results';
  let locationPart = location ? ` in ${location}` : '';
  let pricePart = '';
  
  if (minPrice && maxPrice) {
    pricePart = ` between $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`;
  } else if (minPrice) {
    pricePart = ` from $${minPrice.toLocaleString()}`;
  } else if (maxPrice) {
    pricePart = ` up to $${maxPrice.toLocaleString()}`;
  }
  
  let bedroomsPart = bedrooms ? ` with ${bedrooms}+ bedrooms` : '';
  let typePart = propertyType ? ` ${propertyType}s` : ' properties';
  
  if (location || propertyType || minPrice || maxPrice || bedrooms) {
    title = `${typePart}${locationPart}${pricePart}${bedroomsPart}`;
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  
  const description = `Found ${count} ${title.toLowerCase()} matching your search criteria. Browse our listings to find your ideal property.`;
  
  const searchKeywords = [
    ...keywords,
    'property search',
    'real estate listings',
    'homes for sale',
    'properties',
    'real estate'
  ];
  
  if (location) searchKeywords.push(`${location} real estate`);
  if (propertyType) searchKeywords.push(propertyType);
  if (bedrooms) searchKeywords.push(`${bedrooms} bedroom`);
  
  return (
    <MetaTags
      title={title}
      description={description}
      canonical={canonical || `${baseUrl}/search`}
      image={image}
      type="website"
      locale={locale}
      twitterCard={twitterCard}
      twitterUsername={twitterUsername}
      noIndex={true} // Search results should typically be noindex
      noFollow={noFollow}
      keywords={searchKeywords}
    >
      {children}
    </MetaTags>
  );
}