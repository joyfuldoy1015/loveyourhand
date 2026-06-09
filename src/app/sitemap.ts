import type { MetadataRoute } from 'next';

const BASE = 'https://loveyourhand.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/create`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/fonts`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];
}
