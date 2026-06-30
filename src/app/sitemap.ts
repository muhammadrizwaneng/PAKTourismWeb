import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paktourism.pk';

  const [destinations, attractions, hotels, packages, guides] = await Promise.all([
    prisma.destination.findMany({ select: { id: true, updatedAt: true } }),
    prisma.attraction.findMany({ select: { id: true, updatedAt: true } }),
    prisma.hotel.findMany({ select: { id: true, updatedAt: true } }),
    prisma.tourPackage.findMany({ select: { id: true, updatedAt: true } }),
    prisma.tourGuide.findMany({ select: { id: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                             lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/destinations`,           lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/attractions`,            lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/packages`,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/hotels`,                 lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/guides`,                 lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/emergency`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/account-deletion`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/checklist`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...destinations.map((d: (typeof destinations)[number]) => ({
      url: `${SITE_URL}/destinations/${d.id}`,
      lastModified: d.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...attractions.map((a: (typeof attractions)[number]) => ({
      url: `${SITE_URL}/attractions/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...hotels.map((h: (typeof hotels)[number]) => ({
      url: `${SITE_URL}/hotels/${h.id}`,
      lastModified: h.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...packages.map((p: (typeof packages)[number]) => ({
      url: `${SITE_URL}/packages/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...guides.map((g: (typeof guides)[number]) => ({
      url: `${SITE_URL}/guides/${g.id}`,
      lastModified: g.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
