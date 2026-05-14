import type { MetadataRoute } from 'next'

const BASE_URL = 'https://bringbucket.com'

const staticRoutes = [
  '',
  '/about',
  '/blog',
  '/changelog',
  '/contact',
  '/docs',
  '/support',
  '/status',
  '/legal/privacy',
  '/legal/terms',
  '/legal/cookies',
  '/legal/dpa',
  '/legal/security',
]

const useCaseSlugs = [
  'personal-cloud',
  'student-storage',
  'startup-file-manager',
  'developer-asset-storage',
]

const vsSlugs = ['dropbox', 'google-drive', 'box', 'pcloud', 'notion']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const statics: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))

  const useCases: MetadataRoute.Sitemap = useCaseSlugs.map((slug) => ({
    url: `${BASE_URL}/use-cases/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const vs: MetadataRoute.Sitemap = vsSlugs.map((slug) => ({
    url: `${BASE_URL}/vs/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...statics, ...useCases, ...vs]
}
