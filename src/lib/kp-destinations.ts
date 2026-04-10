import { PrismaClient } from '@prisma/client';
import { prisma } from './db';
import { uploadRemoteImageSafe } from './cloudinary';
import { slugify, toJson, parseJson } from './utils';
import {
  compact,
  KP_TOURISM_BASE_URL,
  normalizeKpAssetUrl,
  stripHtml,
  toNumber,
} from './kp-import-helpers';

const KP_TOP_DESTINATIONS_URL = `${KP_TOURISM_BASE_URL}/api/site/home/kp-top-destinations/`;

export interface KpTopDestination {
  id: number;
  title: string;
  slug: string;
  geographical_area: string | null;
  thumbnail_image: string | null;
  preview_image: string | null;
  location_title: string | null;
  latitude: string | null;
  longitude: string | null;
  description: string | null;
  is_featured: boolean;
  is_top: boolean;
  district_category_id: number | null;
}

interface KpTopDestinationsCategory {
  id: number;
  title: string;
  icon: string | null;
}

interface KpTopDestinationsResponse {
  success: boolean;
  result: KpTopDestination[];
  categories: KpTopDestinationsCategory[];
  message?: string;
}

interface KpDistrictImage {
  id: number;
  image_url: string;
}

interface KpDistrictAboutResponse {
  success: boolean;
  slug: string;
  result: {
    district: KpTopDestination;
    districtImages: KpDistrictImage[];
  };
}

interface KpDistrictAttractionListItem {
  id: number;
  title: string;
  slug: string;
  display_image: string | null;
}

interface KpDistrictAttractionsResponse {
  success: boolean;
  slug: string;
  result: {
    attractionData: KpDistrictAttractionListItem[];
    categories: KpTopDestinationsCategory[];
  };
}

interface KpDistrictGalleryImage {
  id: number;
  title: string;
  image_url: string;
  attractions?: {
    id: number;
    title: string;
  } | null;
}

interface KpDistrictGalleryVideo {
  id: number;
  title: string;
  image_url: string;
  video_url: string;
  attractions?: {
    id: number;
    title: string;
  } | null;
}

interface KpDistrictGalleryResponse {
  success: boolean;
  slug: string;
  result: {
    galleryImages: KpDistrictGalleryImage[];
    galleryVideos: KpDistrictGalleryVideo[];
    galleryVirtualTour: unknown[];
  };
}

interface KpDistrictAccommodationItem {
  id: number;
  title: string;
  slug: string;
  location_title: string | null;
  latitude: string | null;
  longitude: string | null;
  contact_no: string | null;
  preview_image: string | null;
  thumbnail_image: string | null;
  description: string | null;
  website_url: string | null;
  booking_website_url: string | null;
  price_from: number | null;
}

interface KpDistrictAccommodationResponse {
  success: boolean;
  slug: string;
  result: {
    accomodationData: KpDistrictAccommodationItem[];
  };
}

interface DestinationVideoRecord {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  attractionTitle: string | null;
}

export interface ImportKpDestinationsOptions {
  limit?: number;
  maxPages?: number;
  prismaClient?: PrismaClient;
  uploadToCloudinary?: boolean;
}

export interface ImportKpDestinationsResult {
  pagesFetched: number;
  taxonomiesCreated: number;
  destinationsCreated: number;
  destinationsUpdated: number;
  totalProcessed: number;
}

export interface SyncKpDestinationDetailsOptions {
  prismaClient?: PrismaClient;
  uploadToCloudinary?: boolean;
  destinationSlug?: string;
  destinationLimit?: number;
  maxPages?: number;
}

export interface SyncKpDestinationDetailsResult {
  destinationsSynced: number;
  attractionsCreated: number;
  attractionsUpdated: number;
  hotelsCreated: number;
  hotelsUpdated: number;
}

async function fetchKpTopDestinationsPage(page: number, limit: number) {
  const url = new URL(KP_TOP_DESTINATIONS_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('filter', '');
  url.searchParams.set('q', '');

  const response = await fetch(url.toString(), {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`KP Tourism destinations API failed on page ${page} with status ${response.status}`);
  }

  const payload = (await response.json()) as KpTopDestinationsResponse;

  if (!payload.success || !Array.isArray(payload.result)) {
    throw new Error(`KP Tourism destinations API returned an unexpected payload on page ${page}`);
  }

  return payload;
}

async function fetchKpDistrictAbout(id: number, slug: string) {
  const url = new URL(`${KP_TOURISM_BASE_URL}/api/site/detail/district/${id}/${slug}/get`);
  url.searchParams.set('page', '1');
  url.searchParams.set('limit', '100');
  url.searchParams.set('tab', 'about');
  url.searchParams.set('filter', '');
  url.searchParams.set('type', 'null');

  const response = await fetch(url.toString(), { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`KP district about API failed for ${slug} with status ${response.status}`);
  }

  return (await response.json()) as KpDistrictAboutResponse;
}

async function fetchKpDistrictAttractions(id: number, slug: string) {
  const url = new URL(`${KP_TOURISM_BASE_URL}/api/site/detail/district/${id}/${slug}/get`);
  url.searchParams.set('page', '1');
  url.searchParams.set('limit', '100');
  url.searchParams.set('tab', 'attractions');
  url.searchParams.set('filter', '');
  url.searchParams.set('type', 'null');

  const response = await fetch(url.toString(), { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`KP district attractions API failed for ${slug} with status ${response.status}`);
  }

  return (await response.json()) as KpDistrictAttractionsResponse;
}

async function fetchKpDistrictGallery(id: number, slug: string) {
  const url = new URL(`${KP_TOURISM_BASE_URL}/api/site/detail/district/${id}/${slug}/get`);
  url.searchParams.set('page', '1');
  url.searchParams.set('limit', '100');
  url.searchParams.set('tab', 'gallery');
  url.searchParams.set('filter', '');
  url.searchParams.set('type', 'null');

  const response = await fetch(url.toString(), { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`KP district gallery API failed for ${slug} with status ${response.status}`);
  }

  return (await response.json()) as KpDistrictGalleryResponse;
}

async function fetchKpDistrictAccommodation(id: number, slug: string) {
  const url = new URL(`${KP_TOURISM_BASE_URL}/api/site/detail/district/${id}/${slug}/get`);
  url.searchParams.set('page', '1');
  url.searchParams.set('limit', '100');
  url.searchParams.set('tab', 'accomodation');
  url.searchParams.set('filter', '');
  url.searchParams.set('type', 'private_hotels');

  const response = await fetch(url.toString(), { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`KP district accommodation API failed for ${slug} with status ${response.status}`);
  }

  return (await response.json()) as KpDistrictAccommodationResponse;
}

export async function importKpTopDestinations(
  options: ImportKpDestinationsOptions = {}
): Promise<ImportKpDestinationsResult> {
  const limit = options.limit ?? 10;
  const maxPages = options.maxPages ?? 50;
  const prismaClient = options.prismaClient ?? prisma;
  const uploadToCloudinary = options.uploadToCloudinary ?? true;

  let pagesFetched = 0;
  let taxonomiesCreated = 0;
  let destinationsCreated = 0;
  let destinationsUpdated = 0;
  let totalProcessed = 0;

  const taxonomyCache = new Map<number, number>();

  for (let page = 1; page <= maxPages; page += 1) {
    const payload = await fetchKpTopDestinationsPage(page, limit);
    const items = payload.result;

    if (items.length === 0) {
      break;
    }

    pagesFetched += 1;

    for (const category of payload.categories) {
      if (taxonomyCache.has(category.id)) continue;

      const existingTaxonomy = await prismaClient.taxonomy.findFirst({
        where: {
          type: 'destination',
          name: category.title.trim(),
        },
        select: { id: true },
      });

      if (existingTaxonomy) {
        taxonomyCache.set(category.id, existingTaxonomy.id);
        continue;
      }

      const createdTaxonomy = await prismaClient.taxonomy.create({
        data: {
          name: category.title.trim(),
          type: 'destination',
        },
        select: { id: true },
      });

      taxonomyCache.set(category.id, createdTaxonomy.id);
      taxonomiesCreated += 1;
    }

    for (const item of items) {
      totalProcessed += 1;
      const title = item.title.trim();

      const images = Array.from(
        new Set(
          compact([
            normalizeKpAssetUrl(item.thumbnail_image),
            normalizeKpAssetUrl(item.preview_image),
          ])
        )
      );

      const persistedImages = uploadToCloudinary
        ? compact(
            await Promise.all(
              images.map((imageUrl, index) =>
                uploadRemoteImageSafe(
                  imageUrl,
                  'pak-tourism/kp-destinations',
                  `${slugify(item.slug || title)}-${index + 1}`
                )
              )
            )
          )
        : images;

      const destinationSlug = `kp-destination-${slugify(item.slug || title)}`;
      const taxonomyId = item.district_category_id ? taxonomyCache.get(item.district_category_id) ?? null : null;
      const existingDestination = await prismaClient.destination.findUnique({
        where: { slug: destinationSlug },
        select: { id: true },
      });

      await prismaClient.destination.upsert({
        where: { slug: destinationSlug },
        update: {
          title,
          description: stripHtml(item.description),
          city: title,
          province: 'Khyber Pakhtunkhwa',
          bestTime: item.geographical_area || undefined,
          latitude: toNumber(item.latitude),
          longitude: toNumber(item.longitude),
          featuredImage: persistedImages[0] ?? null,
          galleryImages: persistedImages.length > 0 ? JSON.stringify(persistedImages) : null,
          taxonomyId,
          isFeatured: item.is_featured || item.is_top,
        },
        create: {
          title,
          slug: destinationSlug,
          description: stripHtml(item.description),
          city: title,
          province: 'Khyber Pakhtunkhwa',
          bestTime: item.geographical_area || undefined,
          latitude: toNumber(item.latitude),
          longitude: toNumber(item.longitude),
          featuredImage: persistedImages[0] ?? null,
          galleryImages: persistedImages.length > 0 ? JSON.stringify(persistedImages) : null,
          taxonomyId,
          isFeatured: item.is_featured || item.is_top,
        },
      });

      if (existingDestination) {
        destinationsUpdated += 1;
      } else {
        destinationsCreated += 1;
      }
    }

    if (items.length < limit) {
      break;
    }
  }

  return {
    pagesFetched,
    taxonomiesCreated,
    destinationsCreated,
    destinationsUpdated,
    totalProcessed,
  };
}

export async function syncKpDestinationDetails(
  options: SyncKpDestinationDetailsOptions = {}
): Promise<SyncKpDestinationDetailsResult> {
  const prismaClient = options.prismaClient ?? prisma;
  const uploadToCloudinary = options.uploadToCloudinary ?? true;
  const destinationLimit = options.destinationLimit ?? 10;

  let destinationsSynced = 0;
  let attractionsCreated = 0;
  let attractionsUpdated = 0;
  let hotelsCreated = 0;
  let hotelsUpdated = 0;

  const topDestinations: KpTopDestination[] = [];

  const maxPages = options.maxPages ?? 50;
  for (let page = 1; page <= maxPages; page += 1) {
    const payload = await fetchKpTopDestinationsPage(page, destinationLimit);
    const items = payload.result;
    if (items.length === 0) break;

    topDestinations.push(...items);

    if (items.length < destinationLimit) {
      break;
    }
  }

  const filteredDestinations = options.destinationSlug
    ? topDestinations.filter((item) => item.slug === options.destinationSlug)
    : topDestinations;

  for (const item of filteredDestinations) {
    const localDestinationSlug = `kp-destination-${slugify(item.slug || item.title)}`;
    const destination = await prismaClient.destination.findUnique({
      where: { slug: localDestinationSlug },
      select: { id: true, galleryImages: true, galleryVideos: true },
    });

    if (!destination) {
      continue;
    }

    const [aboutPayload, attractionsPayload, galleryPayload, accommodationPayload] = await Promise.all([
      fetchKpDistrictAbout(item.id, item.slug),
      fetchKpDistrictAttractions(item.id, item.slug),
      fetchKpDistrictGallery(item.id, item.slug),
      fetchKpDistrictAccommodation(item.id, item.slug),
    ]);

    const baseGallery = compact(
      aboutPayload.result.districtImages.map((image) => normalizeKpAssetUrl(image.image_url))
    );
    const extraGallery = compact(
      galleryPayload.result.galleryImages.map((image) => normalizeKpAssetUrl(image.image_url))
    );
    const mergedGallery = Array.from(new Set([...baseGallery, ...extraGallery]));
    const persistedGallery: string[] = [];
    if (uploadToCloudinary) {
      for (let i = 0; i < mergedGallery.length; i++) {
        const url = await uploadRemoteImageSafe(
          mergedGallery[i],
          'pak-tourism/kp-destination-gallery',
          `${item.slug}-gallery-${i + 1}`
        );
        if (url) persistedGallery.push(url);
      }
    } else {
      persistedGallery.push(...mergedGallery);
    }

    const persistedVideos: DestinationVideoRecord[] = [];
    for (const video of galleryPayload.result.galleryVideos) {
      const sourceVideoUrl = normalizeKpAssetUrl(video.video_url);
      if (!sourceVideoUrl) continue;

      let videoUrl = sourceVideoUrl;
      if (uploadToCloudinary) {
        const upUrl = await uploadRemoteImageSafe(
          sourceVideoUrl,
          'pak-tourism/kp-destination-videos',
          `${item.slug}-video-${video.id}`
        );
        if (!upUrl) continue;
        videoUrl = upUrl;
      }

      const thumbnailSource = normalizeKpAssetUrl(video.image_url);
      let thumbnailUrl = thumbnailSource;
      if (thumbnailSource && uploadToCloudinary) {
        thumbnailUrl = await uploadRemoteImageSafe(
          thumbnailSource,
          'pak-tourism/kp-destination-video-thumbs',
          `${item.slug}-video-thumb-${video.id}`
        );
      }

      persistedVideos.push({
        id: video.id,
        title: video.title,
        videoUrl,
        thumbnailUrl,
        attractionTitle: video.attractions?.title ?? null,
      });
    }

    const currentGallery = parseJson<string[]>(destination.galleryImages, []);
    const nextGallery = persistedGallery.length > 0 ? persistedGallery : currentGallery;
    const currentVideos = parseJson<DestinationVideoRecord[]>(destination.galleryVideos, []);
    const nextVideos = persistedVideos.length > 0 ? persistedVideos : currentVideos;

    await prismaClient.destination.update({
      where: { id: destination.id },
      data: {
        galleryImages: nextGallery.length > 0 ? toJson(nextGallery) : null,
        galleryVideos: nextVideos.length > 0 ? toJson(nextVideos) : null,
      },
    });

    const attractionTitleToId = new Map<string, { id: number; gallery: string[] }>();

    for (const attraction of attractionsPayload.result.attractionData) {
      const sourceImages = compact([normalizeKpAssetUrl(attraction.display_image)]);
      const persistedImages = uploadToCloudinary
        ? compact(
            await Promise.all(
              sourceImages.map((imageUrl, index) =>
                uploadRemoteImageSafe(
                  imageUrl,
                  'pak-tourism/kp-attractions',
                  `${attraction.slug}-${index + 1}`
                )
              )
            )
          )
        : sourceImages;

      const existing = await prismaClient.attraction.findUnique({
        where: { slug: attraction.slug },
        select: { id: true, gallery: true },
      });

      const nextAttractionGallery = Array.from(
        new Set([...parseJson<string[]>(existing?.gallery, []), ...persistedImages])
      );

      const saved = await prismaClient.attraction.upsert({
        where: { slug: attraction.slug },
        update: {
          title: attraction.title.trim(),
          destinationId: destination.id,
          gallery: nextAttractionGallery.length > 0 ? toJson(nextAttractionGallery) : null,
        },
        create: {
          title: attraction.title.trim(),
          slug: attraction.slug,
          destinationId: destination.id,
          gallery: nextAttractionGallery.length > 0 ? toJson(nextAttractionGallery) : null,
        },
        select: { id: true, gallery: true, title: true },
      });

      attractionTitleToId.set(saved.title.trim().toLowerCase(), {
        id: saved.id,
        gallery: parseJson<string[]>(saved.gallery, []),
      });

      if (existing) {
        attractionsUpdated += 1;
      } else {
        attractionsCreated += 1;
      }
    }

    for (const galleryImage of galleryPayload.result.galleryImages) {
      const attractionTitle = galleryImage.attractions?.title?.trim().toLowerCase();
      if (!attractionTitle) continue;

      const attractionRecord = attractionTitleToId.get(attractionTitle);
      if (!attractionRecord) continue;

      const sourceImage = normalizeKpAssetUrl(galleryImage.image_url);
      if (!sourceImage) continue;

      const persistedImage = uploadToCloudinary
        ? await uploadRemoteImageSafe(
            sourceImage,
            'pak-tourism/kp-attraction-gallery',
            `${item.slug}-${galleryImage.id}`
          )
        : sourceImage;

      if (!persistedImage) continue;

      const nextGalleryImages = Array.from(new Set([...attractionRecord.gallery, persistedImage]));

      await prismaClient.attraction.update({
        where: { id: attractionRecord.id },
        data: {
          gallery: toJson(nextGalleryImages),
        },
      });

      attractionRecord.gallery = nextGalleryImages;
    }

    for (const hotel of accommodationPayload.result.accomodationData) {
      const sourceImages = compact([
        normalizeKpAssetUrl(hotel.preview_image),
        normalizeKpAssetUrl(hotel.thumbnail_image),
      ]);
      const persistedImages = uploadToCloudinary
        ? compact(
            await Promise.all(
              sourceImages.map((imageUrl, index) =>
                uploadRemoteImageSafe(
                  imageUrl,
                  'pak-tourism/kp-hotels',
                  `${hotel.slug}-${index + 1}`
                )
              )
            )
          )
        : sourceImages;

      const existingHotel = await prismaClient.hotel.findUnique({
        where: { slug: hotel.slug },
        select: { id: true },
      });

      await prismaClient.hotel.upsert({
        where: { slug: hotel.slug },
        update: {
          title: hotel.title.trim(),
          description: stripHtml(hotel.description),
          destinationId: destination.id,
          address: hotel.location_title,
          latitude: toNumber(hotel.latitude),
          longitude: toNumber(hotel.longitude),
          phone: hotel.contact_no,
          website: hotel.booking_website_url || hotel.website_url || null,
          gallery: persistedImages.length > 0 ? toJson(persistedImages) : null,
          priceRange: hotel.price_from ? `PKR ${hotel.price_from.toLocaleString()}` : null,
        },
        create: {
          title: hotel.title.trim(),
          slug: hotel.slug,
          description: stripHtml(hotel.description),
          destinationId: destination.id,
          address: hotel.location_title,
          latitude: toNumber(hotel.latitude),
          longitude: toNumber(hotel.longitude),
          phone: hotel.contact_no,
          website: hotel.booking_website_url || hotel.website_url || null,
          gallery: persistedImages.length > 0 ? toJson(persistedImages) : null,
          priceRange: hotel.price_from ? `PKR ${hotel.price_from.toLocaleString()}` : null,
        },
      });

      if (existingHotel) {
        hotelsUpdated += 1;
      } else {
        hotelsCreated += 1;
      }
    }

    destinationsSynced += 1;
  }

  return {
    destinationsSynced,
    attractionsCreated,
    attractionsUpdated,
    hotelsCreated,
    hotelsUpdated,
  };
}
