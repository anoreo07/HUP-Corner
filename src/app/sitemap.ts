import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hupcorner.vercel.app'

  const routes = [
    '',
    '/home',
    '/all-majors',
    '/biotechnology',
    '/pharmacology',
    '/feedback',
    '/pharmaceutical-chemistry',
    '/chemistry',
    '/other-documents',
    '/upload',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))
}