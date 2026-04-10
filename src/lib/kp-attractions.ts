import { PrismaClient } from '@prisma/client';
import { prisma } from './db';
import { uploadRemoteImageSafe } from './cloudinary';
import { slugify, toJson } from './utils';
import {
  compact,
  escapeRegExp,
  KP_TOURISM_BASE_URL,
  normalizeKpAssetUrl,
  stripHtml,
  toNumber,
  toTitleCase,
} from './kp-import-helpers';

const KP_TOP_ATTRACTIONS_URL = `${KP_TOURISM_BASE_URL}/api/site/home/kp-top-attractions/`;

export interface KpTopAttraction {
  id: number;
  title: string;
  slug: string;
  district_id: number | null;
  is_featured: boolean;
  is_top: boolean;
  family: boolean;
  adults: boolean;
  location_title: string | null;
  latitude: string | null;
  longitude: string | null;
  description: string | null;
  display_image: string | null;
  preview_image: string | null;
  views_counter: number;
}

interface KpTopAttractionsResponse {
  success: boolean;
  result: KpTopAttraction[];
  message?: string;
}

export interface ImportKpAttractionsOptions {
  limit?: number;
  maxPages?: number;
  prismaClient?: PrismaClient;
  uploadToCloudinary?: boolean;
}

export interface ImportKpAttractionsResult {
  pagesFetched: number;
  destinationsCreated: number;
  attractionsCreated: number;
  attractionsUpdated: number;
  totalProcessed: number;
}

function inferDistrictName(locationTitle: string | null, title: string, districtId: number | null) {
  const cleanTitle = title.trim();
  const firstSegment = locationTitle?.split(',')[0]?.trim() ?? '';

  let district = firstSegment
    .replace(new RegExp(`^${escapeRegExp(cleanTitle)}\\s*`, 'i'), '')
    .replace(/\b(khyber pakhtunkhwa|pakistan)\b/gi, '')
    .replace(/\b(road|rd|district)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!district && firstSegment) {
    district = firstSegment
      .replace(/\b(road|rd)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  if (!district) {
    district = districtId ? `District ${districtId}` : 'Khyber Pakhtunkhwa';
  }

  return toTitleCase(district);
}

async function fetchKpTopAttractionsPage(page: number, limit: number) {
  const url = new URL(KP_TOP_ATTRACTIONS_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('filter', '');
  url.searchParams.set('q', '');

  const response = await fetch(url.toString(), {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`KP Tourism API failed on page ${page} with status ${response.status}`);
  }

  const payload = (await response.json()) as KpTopAttractionsResponse;

  if (!payload.success || !Array.isArray(payload.result)) {
    throw new Error(`KP Tourism API returned an unexpected payload on page ${page}`);
  }

  return payload.result;
}

export async function importKpTopAttractions(
  options: ImportKpAttractionsOptions = {}
): Promise<ImportKpAttractionsResult> {
  const limit = options.limit ?? 12;
  const maxPages = options.maxPages ?? 50;
  const prismaClient = options.prismaClient ?? prisma;
  const uploadToCloudinary = options.uploadToCloudinary ?? true;

  let pagesFetched = 0;
  let destinationsCreated = 0;
  let attractionsCreated = 0;
  let attractionsUpdated = 0;
  let totalProcessed = 0;

  const destinationCache = new Map<string, number>();

  for (let page = 1; page <= maxPages; page += 1) {
    const items = await fetchKpTopAttractionsPage(page, limit);

    if (items.length === 0) {
      break;
    }

    pagesFetched += 1;

    for (const item of items) {
      totalProcessed += 1;

      const districtName = inferDistrictName(item.location_title, item.title, item.district_id);
      const destinationSlug = `kp-district-${item.district_id ?? 'unknown'}-${slugify(districtName)}`;
      let destinationId = destinationCache.get(destinationSlug);

      if (!destinationId) {
        const existingDestination = await prismaClient.destination.findUnique({
          where: { slug: destinationSlug },
          select: { id: true },
        });

        if (existingDestination) {
          destinationId = existingDestination.id;
        } else {
          const createdDestination = await prismaClient.destination.create({
            data: {
              title: districtName,
              slug: destinationSlug,
              description: `${districtName} in Khyber Pakhtunkhwa, Pakistan.`,
              city: districtName,
              province: 'Khyber Pakhtunkhwa',
              latitude: toNumber(item.latitude),
              longitude: toNumber(item.longitude),
              featuredImage: normalizeKpAssetUrl(item.display_image) ?? normalizeKpAssetUrl(item.preview_image),
              isFeatured: false,
            },
            select: { id: true },
          });

          destinationId = createdDestination.id;
          destinationsCreated += 1;
        }

        destinationCache.set(destinationSlug, destinationId);
      }

      const gallery = Array.from(
        new Set(
          compact([
            normalizeKpAssetUrl(item.display_image),
            normalizeKpAssetUrl(item.preview_image),
          ])
        )
      );

      const persistedGallery = uploadToCloudinary
        ? compact(
            await Promise.all(
              gallery.map((imageUrl, index) =>
                uploadRemoteImageSafe(
                  imageUrl,
                  'pak-tourism/kp-attractions',
                  `${item.slug}-${index + 1}`
                )
              )
            )
          )
        : gallery;

      const existingAttraction = await prismaClient.attraction.findUnique({
        where: { slug: item.slug },
        select: { id: true },
      });

      await prismaClient.attraction.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title.trim(),
          description: stripHtml(item.description),
          destinationId,
          gallery: persistedGallery.length > 0 ? toJson(persistedGallery) : null,
        },
        create: {
          title: item.title.trim(),
          slug: item.slug,
          description: stripHtml(item.description),
          destinationId,
          gallery: persistedGallery.length > 0 ? toJson(persistedGallery) : null,
        },
      });

      if (existingAttraction) {
        attractionsUpdated += 1;
      } else {
        attractionsCreated += 1;
      }
    }

    if (items.length < limit) {
      break;
    }
  }

  return {
    pagesFetched,
    destinationsCreated,
    attractionsCreated,
    attractionsUpdated,
    totalProcessed,
  };
}
