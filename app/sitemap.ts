import { MetadataRoute } from 'next'

export const dynamic = 'force-static'; 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nexus-connect.jp'
  
  const routes = [
    '',
    '/about',
    '/faq',
    '/guidelines',
    '/activity-log',
    '/contact',
    '/privacy',
    '/join',
    '/members',
    '/en',
    '/en/about',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
