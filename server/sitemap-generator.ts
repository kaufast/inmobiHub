import fs from 'fs/promises';
import path from 'path';
import { formatDate } from '../client/src/utils/format';
import { storage } from './storage';

/**
 * Sitemap Generator for Inmobi Real Estate Platform
 * - Generates XML sitemaps for all key pages
 * - Splits into multiple sitemaps to stay under Google's 50,000 URL limit
 * - Creates a sitemap index
 * - Properly formats dates for lastmod
 * - Sets priorities and change frequencies appropriately
 */

const BASE_URL = process.env.SITE_URL || 'https://inmobi.replit.app';
const MAX_URLS_PER_SITEMAP = 10000; // Stay well under 50,000 for safety

/**
 * Generates the XML string for a single sitemap file
 */
function generateSitemapXml(urls: Array<{
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}>): string {
  const urlElements = urls.map(url => {
    const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';
    const changefreq = url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : '';
    const priority = url.priority !== undefined ? `\n    <priority>${url.priority.toFixed(1)}</priority>` : '';
    
    return `  <url>
    <loc>${url.loc}</loc>${lastmod}${changefreq}${priority}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

/**
 * Generates the XML string for a sitemap index file
 */
function generateSitemapIndexXml(sitemaps: Array<{
  loc: string;
  lastmod?: string;
}>): string {
  const sitemapElements = sitemaps.map(sitemap => {
    const lastmod = sitemap.lastmod ? `\n    <lastmod>${sitemap.lastmod}</lastmod>` : '';
    
    return `  <sitemap>
    <loc>${sitemap.loc}</loc>${lastmod}
  </sitemap>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

/**
 * Main function to generate the sitemap files
 */
export async function generateSitemaps(outputDir = './public'): Promise<{ 
  success: boolean; 
  error?: string;
  sitemapIndexPath?: string;
}> {
  try {
    // Ensure the output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    const currentDate = new Date().toISOString();
    const sitemaps = [];
    
    // 1. Create the main sitemap for static pages
    const staticUrls = [
      {
        loc: `${BASE_URL}/`,
        lastmod: currentDate,
        changefreq: 'weekly' as const,
        priority: 1.0
      },
      {
        loc: `${BASE_URL}/search`,
        lastmod: currentDate,
        changefreq: 'daily' as const,
        priority: 0.9
      },
      {
        loc: `${BASE_URL}/about`,
        lastmod: currentDate,
        changefreq: 'monthly' as const,
        priority: 0.7
      },
      {
        loc: `${BASE_URL}/contact`,
        lastmod: currentDate,
        changefreq: 'monthly' as const,
        priority: 0.7
      },
      {
        loc: `${BASE_URL}/blog`,
        lastmod: currentDate,
        changefreq: 'weekly' as const,
        priority: 0.8
      },
      {
        loc: `${BASE_URL}/auth`,
        lastmod: currentDate,
        changefreq: 'monthly' as const,
        priority: 0.6
      },
      {
        loc: `${BASE_URL}/faq`,
        lastmod: currentDate,
        changefreq: 'monthly' as const,
        priority: 0.7
      },
      {
        loc: `${BASE_URL}/pricing`,
        lastmod: currentDate,
        changefreq: 'monthly' as const,
        priority: 0.8
      }
    ];
    
    const staticSitemapPath = path.join(outputDir, 'sitemap-static.xml');
    await fs.writeFile(staticSitemapPath, generateSitemapXml(staticUrls));
    sitemaps.push({
      loc: `${BASE_URL}/sitemap-static.xml`,
      lastmod: currentDate
    });
    
    // 2. Create sitemaps for properties
    try {
      // Get properties from database (limit as needed)
      let allProperties = [];
      try {
        // Try to get from storage
        allProperties = await storage.getProperties(50000, 0);
      } catch (err) {
        console.error('Failed to get properties from storage:', err);
        // Fallback to empty array
        allProperties = [];
      }
      
      // Split properties into chunks
      const propertyChunks: Array<any[]> = [];
      for (let i = 0; i < allProperties.length; i += MAX_URLS_PER_SITEMAP) {
        propertyChunks.push(allProperties.slice(i, i + MAX_URLS_PER_SITEMAP));
      }
      
      // Create a sitemap for each chunk
      for (let i = 0; i < propertyChunks.length; i++) {
        const properties = propertyChunks[i];
        const propertyUrls = properties.map(property => ({
          loc: `${BASE_URL}/property/${property.id}`,
          lastmod: property.updatedAt?.toISOString() || currentDate,
          changefreq: 'daily' as const,
          priority: 0.9
        }));
        
        const propertySitemapPath = path.join(outputDir, `sitemap-properties-${i + 1}.xml`);
        await fs.writeFile(propertySitemapPath, generateSitemapXml(propertyUrls));
        sitemaps.push({
          loc: `${BASE_URL}/sitemap-properties-${i + 1}.xml`,
          lastmod: currentDate
        });
      }
    } catch (err) {
      console.error('Error generating property sitemaps:', err);
    }
    
    // 3. Create sitemaps for neighborhoods
    try {
      // Get neighborhoods from database
      let allNeighborhoods = [];
      try {
        // Try to get from storage
        allNeighborhoods = await storage.getNeighborhoods();
      } catch (err) {
        console.error('Failed to get neighborhoods from storage:', err);
        // Fallback to empty array
        allNeighborhoods = [];
      }
      
      const neighborhoodUrls = allNeighborhoods.map(neighborhood => ({
        loc: `${BASE_URL}/neighborhood/${neighborhood.id}`,
        lastmod: neighborhood.updatedAt?.toISOString() || currentDate,
        changefreq: 'weekly' as const,
        priority: 0.8
      }));
      
      const neighborhoodSitemapPath = path.join(outputDir, 'sitemap-neighborhoods.xml');
      await fs.writeFile(neighborhoodSitemapPath, generateSitemapXml(neighborhoodUrls));
      sitemaps.push({
        loc: `${BASE_URL}/sitemap-neighborhoods.xml`,
        lastmod: currentDate
      });
    } catch (err) {
      console.error('Error generating neighborhood sitemaps:', err);
    }
    
    // 4. Create sitemaps for blog posts
    try {
      // Get blog posts from database
      let allBlogPosts = [];
      try {
        // Try to get from storage
        allBlogPosts = await storage.getBlogPosts();
      } catch (err) {
        console.error('Failed to get blog posts from storage:', err);
        // Fallback to empty array
        allBlogPosts = [];
      }
      
      const blogPostUrls = allBlogPosts.map(post => ({
        loc: `${BASE_URL}/blog/${post.slug}`,
        lastmod: post.updatedAt?.toISOString() || currentDate,
        changefreq: 'monthly' as const,
        priority: 0.7
      }));
      
      const blogSitemapPath = path.join(outputDir, 'sitemap-blog.xml');
      await fs.writeFile(blogSitemapPath, generateSitemapXml(blogPostUrls));
      sitemaps.push({
        loc: `${BASE_URL}/sitemap-blog.xml`,
        lastmod: currentDate
      });
    } catch (err) {
      console.error('Error generating blog sitemaps:', err);
    }
    
    // 5. Create the sitemap index file
    const sitemapIndexPath = path.join(outputDir, 'sitemap.xml');
    await fs.writeFile(sitemapIndexPath, generateSitemapIndexXml(sitemaps));
    
    console.log(`Generated ${sitemaps.length} sitemaps and index at ${sitemapIndexPath}`);
    
    return {
      success: true,
      sitemapIndexPath: `${BASE_URL}/sitemap.xml`
    };
  } catch (error) {
    console.error('Error generating sitemaps:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}