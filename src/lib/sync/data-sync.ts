import fs from 'fs';
import path from 'path';
import { prisma } from '../db';

const SYNC_DIR = path.join(process.cwd(), 'public/api');

// Ensure the directory exists
if (!fs.existsSync(SYNC_DIR)) {
  fs.mkdirSync(SYNC_DIR, { recursive: true });
}

export async function syncDataToJson() {
  try {
    const [
      destinations,
      attractions,
      hotels,
      guides,
      packages,
      banners
    ] = await Promise.all([
      prisma.destination.findMany({ include: { _count: { select: { attractions: true, hotels: true, packages: true } } } }),
      prisma.attraction.findMany({ include: { destination: { select: { title: true } } } }),
      prisma.hotel.findMany({ include: { destination: { select: { title: true } } } }),
      prisma.tourGuide.findMany(),
      prisma.tourPackage.findMany({ include: { destination: { select: { title: true } } } }),
      prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })
    ]);

    const dataMap = {
      'destinations.json': destinations,
      'attractions.json': attractions,
      'hotels.json': hotels,
      'guides.json': guides,
      'packages.json': packages,
      'banners.json': banners,
      'all_data.json': {
        destinations,
        attractions,
        hotels,
        guides,
        packages,
        banners,
        timestamp: new Date().toISOString()
      }
    };

    for (const [filename, content] of Object.entries(dataMap)) {
      const filePath = path.join(SYNC_DIR, filename);
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    }

    console.log('✅ Data synced to JSON successfully');
  } catch (error) {
    console.error('❌ Error syncing data to JSON:', error);
  }
}
