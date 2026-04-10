import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const abbottabad = await prisma.destination.findFirst({
    where: { title: { contains: 'Abbottabad' } }
  });
  
  if (abbottabad) {
    console.log("Found in DB:", abbottabad.slug);
    console.log("Gallery images:", abbottabad.galleryImages);
  } else {
    console.log("Not found in DB");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
