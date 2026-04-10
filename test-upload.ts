import { PrismaClient } from '@prisma/client';
import { uploadRemoteImageSafe } from './src/lib/cloudinary';
import { normalizeKpAssetUrl } from './src/lib/kp-import-helpers';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching Abbottabad from DB...");
  const dest = await prisma.destination.findFirst({ where: { title: { contains: 'Abbottabad' } } });
  if (!dest) {
    console.log("NOT FOUND in DB");
    return;
  }
  
  console.log("Found:", dest.title, dest.slug);
  
  // KP ID is likely 2, slug abbottabad-devsg
  const url = `https://prod-admin.kptourism.com/api/site/detail/district/2/abbottabad-devsg/get?page=1&limit=100&tab=gallery&filter=&type=null`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  const payload = await response.json();
  
  const images = payload.result?.galleryImages || [];
  console.log("Fetched images length from API:", images.length);
  
  if (images.length > 0) {
    const firstImage = images[0].image_url;
    const normalizedUrl = normalizeKpAssetUrl(firstImage);
    console.log("Testing upload for:", normalizedUrl);
    
    try {
      const upUrl = await uploadRemoteImageSafe(normalizedUrl ?? '', 'pak-tourism/test', 'test-upload-sync');
      console.log("Upload resolved with URL:", upUrl);
    } catch(e) {
      console.error("Upload threw an error:", e);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
