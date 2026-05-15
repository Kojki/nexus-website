import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-static'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nexus-connect.jp'
  
  // 1. 静的ページの設定
  const staticRoutes = [
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

  // 2. Supabaseから活動記録の全スラッグを取得して追加
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: activities } = await supabase
      .from('activities')
      .select('slug, updated_at');

    if (activities) {
      dynamicRoutes = activities.map((activity) => ({
        url: `${baseUrl}/activity-log/${activity.slug}`,
        lastModified: new Date(activity.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Sitemap error:', error);
  }

  return [...staticRoutes, ...dynamicRoutes]
}
