import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter } as any);

interface HospitalData {
  city: string;
  hospitals: string[];
}

async function parseHospitalFiles() {
  const files = [
    'List of Hospitals in Balochistan, Pakistan.pdf.txt',
    'List of Hospitals in Punjab, Pakistan.pdf.txt',
    'List of Hospitals in Sindh, Pakistan.pdf.txt'
  ];

  const allHospitals: HospitalData[] = [];

  for (const fileName of files) {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${fileName}. Skipping.`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let currentCity = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;

      // Skip title line (e.g., "List of Hospitals in Punjab, Pakistan")
      if (line.toLowerCase().includes('list of hospitals')) continue;

      // Check for bullet points
      if (line.includes('●')) {
        const parts = line.split('●').filter(p => p.trim());
        for (const part of parts) {
          if (part.includes(':')) {
            // This is the City: Hospital A, Hospital B format
            const [cityPart, hospitalsPart] = part.split(':');
            const city = cityPart.trim();
            // Don't include "Other Districts" as a city name
            if (city.toLowerCase().includes('other')) continue;
            
            const hospitals = hospitalsPart.split(',').map(h => h.trim()).filter(h => h);
            allHospitals.push({ city, hospitals });
          } else if (currentCity) {
            // Normal bullet point list under currentCity
            const hospital = part.trim();
            const existing = allHospitals.find(a => a.city === currentCity);
            if (existing) {
              existing.hospitals.push(hospital);
            } else {
              allHospitals.push({ city: currentCity, hospitals: [hospital] });
            }
          }
        }
      } else if (line.length < 50 && !line.includes(':')) {
        // Potential city name (like "Lahore")
        currentCity = line.replace(/  /g, ' ').trim();
      }
    }
  }

  return allHospitals;
}

async function main() {
  console.log('🏥 Starting Hospital Seeding...');

  const data = await parseHospitalFiles();
  console.log(`🔍 Parsed ${data.reduce((acc, curr) => acc + curr.hospitals.length, 0)} hospitals in ${data.length} cities.`);

  for (const item of data) {
    const citySlug = item.city.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    // Find destination
    let destination = await prisma.destination.findFirst({
      where: {
        OR: [
          { slug: citySlug },
          { city: { contains: item.city } },
          { title: { contains: item.city } }
        ]
      }
    });

    if (!destination) {
      console.log(`✨ Creating placeholder destination for city: ${item.city}`);
      try {
        destination = await prisma.destination.create({
          data: {
            title: item.city,
            slug: citySlug,
            city: item.city,
            province: 'Pakistan', // Default, will try to infer if possible
            description: `Hospitals and medical facilities in ${item.city}.`,
            featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
          }
        });
      } catch (e) {
        console.error(`❌ Could not create destination for ${item.city}:`, e);
        continue;
      }
    }

    console.log(`✅ Ready to seed ${item.hospitals.length} hospitals for ${destination.title}.`);

    for (const hospitalName of item.hospitals) {
      const hospitalSlug = `${citySlug}-${hospitalName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')}`.substring(0, 190);
      
      try {
        await prisma.pointOfInterest.upsert({
          where: { slug: hospitalSlug },
          update: {
            title: hospitalName,
            category: 'Hospital',
            destinationId: destination.id,
            address: `${hospitalName}, ${destination.city}`,
          },
          create: {
            title: hospitalName,
            slug: hospitalSlug,
            category: 'Hospital',
            destinationId: destination.id,
            address: `${hospitalName}, ${destination.city}`,
            gallery: JSON.stringify([])
          }
        });
      } catch (error) {
        console.error(`❌ Error seeding hospital ${hospitalName}:`, error);
      }
    }
  }

  console.log('🏁 Hospital Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
