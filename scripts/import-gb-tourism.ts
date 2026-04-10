// @ts-nocheck
import * as cheerio from 'cheerio';
import { prisma } from '../src/lib/db';
import { slugify } from '../src/lib/utils';
import { uploadRemoteImageSafe } from '../src/lib/cloudinary';

const BASE_URL = 'https://visitgilgitbaltistan.gov.pk';

async function fetchPage(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.statusText}`);
      return null;
    }
    return await response.text();
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return null;
  }
}

async function importGbTourism() {
  console.log('=========================================');
  console.log('STARTING GB TOURISM DATA IMPORT');
  console.log('=========================================\n');

  // Districts 1 to 10 cover the main districts of GB
  for (let id = 1; id <= 10; id++) {
    const districtUrl = `${BASE_URL}/district/id/${id}`;
    console.log(`\n--- Processing District ID ${id} ---`);

    const html = await fetchPage(districtUrl);
    if (!html) continue;

    const $ = cheerio.load(html);
    
    // Extract District Name - structure: <h2> District [Name]</h2>
    // Looking at scratch.html research: <h2 id="district-title"> District Gilgit</h2>
    let districtName = $('h2').filter((i, el) => $(el).text().toLowerCase().includes('district')).first().text().trim();
    districtName = districtName.replace(/^District\s+/i, '').trim();
    
    if (!districtName || districtName === 'Gilgit Tourist Destinations') {
        // More robust check
        districtName = $('h2').eq(1).text().trim().replace(/^District\s+/i, '');
    }

    if (!districtName) {
        console.warn(`Could not find district name for ID ${id}`);
        continue;
    }

    console.log(`Importing District: ${districtName}`);

    // Extract Description - multiple <p> tags
    const description = $('p').map((i, el) => $(el).text().trim()).get()
        .filter(t => t.length > 50 && !t.includes('Government of Gilgit'))
        .join('\n\n')
        .slice(0, 1000);

    const slug = slugify(districtName);

    // Upsert Destination
    const destination = await prisma.destination.upsert({
      where: { slug },
      update: {
        title: districtName,
        description: description || `Welcome to ${districtName}, Gilgit-Baltistan.`,
        province: 'Gilgit-Baltistan',
        city: districtName,
      },
      create: {
        title: districtName,
        slug,
        description: description || `Welcome to ${districtName}, Gilgit-Baltistan.`,
        province: 'Gilgit-Baltistan',
        city: districtName,
      },
    });

    // Find Tour Links: <a href="/tour/id/[id]">
    const tourLinks: string[] = [];
    $('a[href^="/tour/id/"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) tourLinks.push(href);
    });

    // Unique links
    const uniqueTourLinks = Array.from(new Set(tourLinks));
    console.log(`Found ${uniqueTourLinks.length} tours in ${districtName}`);

    for (const href of uniqueTourLinks) {
      const tourUrl = `${BASE_URL}${href}`;
      console.log(`  Processing Tour: ${tourUrl}`);
      const tourHtml = await fetchPage(tourUrl);
      if (!tourHtml) continue;

      const $tour = cheerio.load(tourHtml);
      // <h2 style="width: 100%">Naltar Valley</h2>
      const tourTitle = $tour('h2[style*="width: 100%"]').text().trim() || $tour('h2').first().text().trim();
      if (!tourTitle || tourTitle.includes('Tourist Detail')) continue;

      // <p style="text-align:justify">
      const tourDesc = $tour('p[style*="text-align:justify"]').text().trim() || $tour('p').first().text().trim();
      const tourSlug = slugify(tourTitle);

      // Extract Image
      const imgSrc = $tour('img.img-responsive').attr('src');
      let cloudinaryUrl = null;
      if (imgSrc) {
        const absoluteImgUrl = imgSrc.startsWith('http') ? imgSrc : `${BASE_URL}${imgSrc}`;
        cloudinaryUrl = await uploadRemoteImageSafe(absoluteImgUrl, 'pak-tourism/gb-attractions', tourSlug);
      }

      // Upsert Attraction
      await prisma.attraction.upsert({
        where: { slug: tourSlug },
        update: {
          title: tourTitle,
          description: tourDesc,
          destinationId: destination.id,
          gallery: cloudinaryUrl ? JSON.stringify([cloudinaryUrl]) : undefined,
        },
        create: {
          title: tourTitle,
          slug: tourSlug,
          description: tourDesc,
          destinationId: destination.id,
          gallery: cloudinaryUrl ? JSON.stringify([cloudinaryUrl]) : null,
        },
      });
      console.log(`    Imported Attraction: ${tourTitle}`);
    }
  }

  console.log('\n=========================================');
  console.log('GB TOURISM DATA IMPORT COMPLETED');
  console.log('=========================================');
}

importGbTourism()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
