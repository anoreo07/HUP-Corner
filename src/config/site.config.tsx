import { Metadata } from 'next';
import { LAYOUT_OPTIONS } from '@/config/enums';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';

enum MODE {
  DARK = 'dark',
  LIGHT = 'light',
}

export const siteConfig = {
  title: 'HUP Corner - Chia sẻ tài liệu HUP',
  description: `HUP Corner là góc nhỏ dành cho sinh viên HUP – nơi tổng hợp tài liệu, tips học tập, và chia sẻ kinh nghiệm từ chính sinh viên. Học chung, chia sẻ chung, cùng nhau tiến bộ!`,
  // update this to your real production URL when available
  siteUrl: 'https://hupcorner.vercel.app',
  keywords: ['HUP', 'tài liệu HUP', 'sinh viên HUP', 'HUP Corner', 'học tập HUP', 'đề cương HUP', 'slide bài giảng HUP', 'bài tập HUP', 'đề thi HUP'],
  logo: '/logo-512.png',
  icon: '/logo-512.png',
  mode: MODE.LIGHT,
  layout: LAYOUT_OPTIONS.HYDROGEN,
};

export const metaObject = (
  title?: string,
  openGraph?: OpenGraph,
  description: string = siteConfig.description
): Metadata => {
  return {
    title: title ? `${title} - ${siteConfig.title}` : siteConfig.title,
    description,
    keywords: siteConfig.keywords,
    openGraph: openGraph ?? {
      title: title ? `${title} - ${siteConfig.title}` : title,
      description,
      url: siteConfig.siteUrl,
      siteName: siteConfig.title, // https://developers.google.com/search/docs/appearance/site-names
      // Use a public URL for the OpenGraph image to avoid build-time module
      // resolution errors. Place `opengraph-image.png` in the `public/` folder
      // (recommended) or adjust this URL to point to your CDN/absolute URL.
      images: `${siteConfig.siteUrl}/opengraph-image.png`,
      locale: 'en_US',
      type: 'website',
    },
  };
};
