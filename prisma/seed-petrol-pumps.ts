import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const lahorePetrolPumps = [
  { title: 'PSO Petrol Station - Gulberg', address: 'Main Boulevard Gulberg III, Lahore', phone: '042-35761234', latitude: 31.5204, longitude: 74.3587 },
  { title: 'Shell Fuel Station - DHA Phase 5', address: 'Syed Maratib Ali Road, DHA Phase 5, Lahore', phone: '042-35892100', latitude: 31.4775, longitude: 74.4009 },
  { title: 'Total Energies - Johar Town', address: 'Johar Town Block E, Lahore', phone: '042-35296400', latitude: 31.4697, longitude: 74.2728 },
  { title: 'Attock Petroleum - Model Town', address: 'Model Town Link Road, Lahore', phone: '042-35168900', latitude: 31.4912, longitude: 74.3236 },
  { title: 'PSO Petrol Station - Ferozepur Road', address: 'Ferozepur Road near Chungi Amar Sadhu, Lahore', phone: '042-35434100', latitude: 31.4632, longitude: 74.2891 },
  { title: 'Caltex (Chevron) - Garden Town', address: 'Jail Road, Garden Town, Lahore', phone: '042-35773022', latitude: 31.5025, longitude: 74.3302 },
  { title: 'PSO Petrol Station - Wapda Town', address: 'Wapda Town Phase 1, Lahore', phone: '042-35291780', latitude: 31.4600, longitude: 74.2645 },
  { title: 'Shell Fuel Station - Allama Iqbal Town', address: 'Raiwind Road, Allama Iqbal Town, Lahore', phone: '042-35410990', latitude: 31.4543, longitude: 74.3115 },
  { title: 'Total Energies - Cantt', address: 'Walton Road, Cantt, Lahore', phone: '042-36624500', latitude: 31.5419, longitude: 74.3895 },
  { title: 'PSO Petrol Station - Shahdara', address: 'GT Road, Shahdara, Lahore', phone: '042-37940220', latitude: 31.6089, longitude: 74.3165 },
];

async function main() {
  // Find Lahore destination
  const lahore = await prisma.destination.findFirst({
    where: { city: { contains: 'Lahore' } },
  });

  if (!lahore) {
    console.error('❌ Lahore destination not found. Please seed destinations first.');
    process.exit(1);
  }

  console.log(`✅ Found Lahore destination (id: ${lahore.id})`);

  let created = 0;
  for (const pump of lahorePetrolPumps) {
    const slug = pump.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await prisma.pointOfInterest.findFirst({ where: { slug } });
    if (existing) {
      console.log(`⚠️  Skipping (already exists): ${pump.title}`);
      continue;
    }

    await prisma.pointOfInterest.create({
      data: {
        title: pump.title,
        slug,
        address: pump.address,
        phone: pump.phone,
        latitude: pump.latitude,
        longitude: pump.longitude,
        category: 'Fuel',
        destinationId: lahore.id,
      },
    });
    console.log(`✨ Created: ${pump.title}`);
    created++;
  }

  console.log(`\n🎉 Done! Created ${created} petrol pump(s) for Lahore.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
