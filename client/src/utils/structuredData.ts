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
 * Creates JSON-LD structured data for the organization
 * @param org Organization data
 * @returns JSON-LD string for use in script tag
 */
export function generateOrganizationStructuredData(org: Organization): string {
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
export function generateBreadcrumbStructuredData(
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