const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Pakistan Tourism database (CommonJS)...');

  // Taxonomies
  const mountainType = await prisma.taxonomy.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Mountain', type: 'destination' },
  });
  const historicalType = await prisma.taxonomy.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: 'Historical', type: 'destination' },
  });

  // Destinations
  const hunza = await prisma.destination.upsert({
    where: { slug: 'hunza-valley' },
    update: {},
    create: {
      title: 'Hunza Valley',
      slug: 'hunza-valley',
      description: 'A breathtaking mountain valley in Gilgit-Baltistan.',
      city: 'Karimabad',
      province: 'Gilgit-Baltistan',
      bestTime: 'April to October',
      latitude: 36.3167,
      longitude: 74.65,
      featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      galleryImages: JSON.stringify(['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']),
      taxonomyId: mountainType.id,
      isFeatured: true,
    },
  });

  const lahore = await prisma.destination.upsert({
    where: { slug: 'lahore' },
    update: {},
    create: {
      title: 'Lahore',
      slug: 'lahore',
      description: 'The cultural heart of Pakistan.',
      city: 'Lahore',
      province: 'Punjab',
      bestTime: 'October to March',
      latitude: 31.5497,
      longitude: 74.3436,
      featuredImage: 'https://images.unsplash.com/photo-1599982890963-3aabd60064d2?w=800',
      galleryImages: JSON.stringify([]),
      taxonomyId: historicalType.id,
      isFeatured: true,
    },
  });

  // Banners
  await prisma.banner.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Discover the Beauty of Pakistan',
      subtitle: 'Mountains, History, Culture',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600',
      linkUrl: '/destinations',
      isActive: true,
      sortOrder: 1,
    },
  });

  // Packages
  await prisma.tourPackage.upsert({
    where: { slug: 'hunza-7-day-explorer' },
    update: {},
    create: {
      title: 'Hunza 7-Day Explorer',
      slug: 'hunza-7-day-explorer',
      description: 'A complete 7-day tour of Hunza Valley.',
      destinationId: hunza.id,
      price: 45000,
      durationDays: 7,
      maxPeople: 12,
      featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      includes: JSON.stringify(['Accommodation', 'Breakfast']),
      excludes: JSON.stringify(['Airfare']),
      isFeatured: true,
    },
  });

  // Guides
  await prisma.tourGuide.upsert({
    where: { slug: 'ali-hassan-guide' },
    update: {},
    create: {
      name: 'Ali Hassan',
      slug: 'ali-hassan-guide',
      description: 'Professional mountain guide.',
      phone: '+92-300-1234567',
      languages: JSON.stringify(['Urdu', 'English']),
      rating: 4.9,
    },
  });

  console.log('✅ Seeding complete!');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
