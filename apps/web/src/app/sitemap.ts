import type { MetadataRoute } from 'next';

const siteUrl = 'https://naploo.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.naploo.com';

type SitemapEntry = MetadataRoute.Sitemap[number];

type HotelCard = {
  id: string;
  businessName: string;
  businessType: 'hotel' | 'homestay';
  city: string;
  createdAt?: string;
  summary?: {
    roomCount?: number;
    podSetCount?: number;
    hasRooms?: boolean;
    hasPods?: boolean;
  };
};

const staticPages: Array<{ path: string; priority: number; changeFrequency: SitemapEntry['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/search', priority: 0.95, changeFrequency: 'daily' },
  { path: '/pods', priority: 0.9, changeFrequency: 'daily' },
  { path: '/locations', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/download', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/partner', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/investor', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/how-it-works', priority: 0.75, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/faqs', priority: 0.65, changeFrequency: 'monthly' },
  { path: '/help', priority: 0.65, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/apply', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/careers', priority: 0.55, changeFrequency: 'monthly' },
  { path: '/press', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/safety', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.35, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.35, changeFrequency: 'yearly' },
  { path: '/refund', priority: 0.35, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
];

const blogSlugs = [
  'economic-growth-job-creation-sleeping-pod-industry',
  'corporate-office-nap-rooms-productivity',
];

function absoluteUrl(path: string) {
  if (path === '/') return siteUrl;
  return `${siteUrl}${path}`;
}

function searchUrl(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  return `${siteUrl}/search?${query.toString()}`.replace(/&/g, '&amp;');
}

async function fetchHotels(): Promise<HotelCard[]> {
  try {
    const res = await fetch(`${apiUrl}/api/v1/hotels`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.hotels) ? data.hotels : [];
  } catch {
    return [];
  }
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const hotels = await fetchHotels();
  const cities = [...new Set(hotels.map((hotel) => hotel.city).filter(Boolean))].sort();
  const entries: SitemapEntry[] = staticPages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  for (const slug of blogSlugs) {
    entries.push({
      url: absoluteUrl(`/blog/${slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    });
  }

  for (const city of cities) {
    entries.push(
      { url: searchUrl({ location: city }), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: searchUrl({ location: city, mode: 'rooms' }), lastModified: now, changeFrequency: 'daily', priority: 0.88 },
      { url: searchUrl({ location: city, mode: 'pods' }), lastModified: now, changeFrequency: 'daily', priority: 0.88 },
      { url: searchUrl({ location: city, type: 'hotel' }), lastModified: now, changeFrequency: 'daily', priority: 0.84 },
      { url: searchUrl({ location: city, type: 'homestay' }), lastModified: now, changeFrequency: 'weekly', priority: 0.78 }
    );
  }

  for (const hotel of hotels) {
    const lastModified = hotel.createdAt ? new Date(hotel.createdAt) : now;
    entries.push({
      url: absoluteUrl(`/property/${hotel.id}`),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.92,
    });

    const hasRooms = hotel.summary?.hasRooms || Number(hotel.summary?.roomCount || 0) > 0;
    const hasPods = hotel.summary?.hasPods || Number(hotel.summary?.podSetCount || 0) > 0;
    if (hasRooms) {
      entries.push({
        url: `${absoluteUrl(`/property/${hotel.id}`)}?mode=rooms`,
        lastModified,
        changeFrequency: 'daily',
        priority: 0.86,
      });
    }
    if (hasPods) {
      entries.push({
        url: `${absoluteUrl(`/property/${hotel.id}`)}?mode=pods`,
        lastModified,
        changeFrequency: 'daily',
        priority: 0.86,
      });
    }
  }

  return entries;
}