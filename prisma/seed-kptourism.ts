import { importKpTopDestinations, syncKpDestinationDetails } from '../src/lib/kp-destinations';
import { importKpTopAttractions } from '../src/lib/kp-attractions';
import { uploadRemoteImageSafe } from '../src/lib/cloudinary';
import { normalizeKpAssetUrl } from '../src/lib/kp-import-helpers';
import { prisma } from '../src/lib/db';
import { slugify } from '../src/lib/utils';

async function fetchPoiList(query: string) {
  const url = `https://prod-admin.kptourism.com/api/site/home/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url.toString(), { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) {
    console.error(`Failed to fetch POI list for query: ${query}`);
    return [];
  }
  const payload = await response.json();
  return payload.result?.poiData || [];
}

async function fetchPoiDetail(id: number, slug: string) {
  const url = `https://prod-admin.kptourism.com/api/site/detail/poi/${id}/${slug}/get?page=1&limit=10&tab=about&filter=&type=null`;
  const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) {
    return null;
  }
  const payload = await response.json();
  return payload.result?.poiAbout || null;
}

async function importPoisByCategory(query: string, category: string) {
  const list = await fetchPoiList(query);
  console.log(`Found ${list.length} POIs for category: ${category}`);

  for (const item of list) {
    const detail = await fetchPoiDetail(item.id, item.slug);
    if (!detail) continue;

    console.log(`Processing POI: ${detail.title}`);

    // Map Cloudinary images
    const images: string[] = [];
    if (detail.display_image) {
      const normalizedUrl = normalizeKpAssetUrl(detail.display_image);
      if (normalizedUrl) {
        const cloudinaryUrl = await uploadRemoteImageSafe(normalizedUrl, 'pak-tourism/pois', `${detail.slug}-display`);
        if (cloudinaryUrl) images.push(cloudinaryUrl);
      }
    }

    // There are slider images potentially
    if (detail.sliders) {
      for (let i = 0; i < detail.sliders.length; i++) {
        const sliderImg = detail.sliders[i].image_url;
        const normalizedUrl = normalizeKpAssetUrl(sliderImg);
        if (normalizedUrl) {
          const cloudinaryUrl = await uploadRemoteImageSafe(normalizedUrl, 'pak-tourism/pois', `${detail.slug}-slider-${i}`);
          if (cloudinaryUrl) images.push(cloudinaryUrl);
        }
      }
    }

    const latitude = parseFloat(detail.latitude) || null;
    const longitude = parseFloat(detail.longitude) || null;

    await prisma.pointOfInterest.upsert({
      where: { slug: item.slug },
      update: {
        title: detail.title,
        description: detail.description?.replace(/<[^>]+>/g, ''),
        address: detail.location_title,
        phone: detail.contact_no,
        latitude,
        longitude,
        category,
        gallery: images.length > 0 ? JSON.stringify(images) : null,
      },
      create: {
        title: detail.title,
        slug: item.slug,
        description: detail.description?.replace(/<[^>]+>/g, ''),
        address: detail.location_title,
        phone: detail.contact_no,
        latitude,
        longitude,
        category,
        gallery: images.length > 0 ? JSON.stringify(images) : null,
      }
    });
  }
}

async function fetchHelpline() {
  console.log('Fetching Helpline Info...');
  const url = `https://prod-admin.kptourism.com/api/site/visitkp/get`;
  const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) {
    console.error('Failed to fetch Visit KP helpline api');
    return;
  }
  const payload = await response.json();
  const infoData = payload.result?.infoData || [];

  for (const item of infoData) {
    if (item.type !== 'helpline') continue;
    const images: string[] = [];
    if (item.display_image) {
      const normalizedUrl = normalizeKpAssetUrl(item.display_image);
      if (normalizedUrl) {
        const cloudinaryUrl = await uploadRemoteImageSafe(normalizedUrl, 'pak-tourism/helpline', slugify(item.title));
        if (cloudinaryUrl) images.push(cloudinaryUrl);
      }
    }

    await prisma.pointOfInterest.upsert({
      where: { slug: slugify(item.title) },
      update: {
        title: item.title,
        description: item.description?.replace(/<[^>]+>/g, ''),
        address: item.location_title,
        phone: item.contact_no,
        category: 'Helpline',
        gallery: images.length > 0 ? JSON.stringify(images) : null,
      },
      create: {
        title: item.title,
        slug: slugify(item.title),
        description: item.description?.replace(/<[^>]+>/g, ''),
        address: item.location_title,
        phone: item.contact_no,
        category: 'Helpline',
        gallery: images.length > 0 ? JSON.stringify(images) : null,
      }
    });
  }
}


async function main() {
  console.log("=========================================");
  console.log("STARTING KP TOURISM DATA MIGRATION");
  console.log("=========================================\n");

  console.log("1. Importing KP Destinations...");
  const destResult = await importKpTopDestinations({ limit: 10, maxPages: 2 });
  console.log("Destinations Result:", destResult);

  console.log("\n1b. Syncing KP Destination Details (Gallery, Videos, Accommodations)...");
  const destDetailsResult = await syncKpDestinationDetails({ destinationLimit: 10, maxPages: 2 });
  console.log("Destinations Details Sync Result:", destDetailsResult);

  console.log("\n2. Importing KP Attractions...");
  const attrResult = await importKpTopAttractions({ limit: 10, maxPages: 2 });
  console.log("Attractions Result:", attrResult);

  console.log("\n3. Importing Points of Interest (POIs)...");
  await importPoisByCategory('Petrol', 'Petrol Pump');
  await importPoisByCategory('Police', 'Police Station');

  console.log("\n4. Importing Helpline data...");
  await fetchHelpline();

  console.log("\nMigration completed successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
