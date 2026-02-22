import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://axioraquote.axioralabs.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // IMPORTANT: Hide your private user dashboards and API routes from Google!
      disallow: ['/dashboard/', '/api/', '/_next/'], 
    },
    // Tell Google exactly where to find the sitemap you created in Step 1
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}