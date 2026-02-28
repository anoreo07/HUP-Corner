import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hupcorner.vercel.app'

  const routes = [
    '',
    '/trang-chu',
    '/tat-ca',
    '/cong-nghe-sinh-hoc',
    '/duoc-hoc',
    '/gop-y',
    '/hoa-duoc',
    '/hoa-hoc',
    '/nhan-xet-giang-vien',
    '/upload',
    '/viet-danh-gia',
    '/xem-danh-gia',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))
}