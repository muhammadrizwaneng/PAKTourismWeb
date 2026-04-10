import { importKpTopAttractions } from '../src/lib/kp-attractions';
import { importKpTopDestinations } from '../src/lib/kp-destinations';
import { createTursoPrismaClient } from '../src/lib/turso-prisma';

async function main() {
  const prisma = createTursoPrismaClient();

  try {
    const destinations = await importKpTopDestinations({
      limit: 10,
      maxPages: 50,
      prismaClient: prisma,
    });

    const attractions = await importKpTopAttractions({
      limit: 12,
      maxPages: 50,
      prismaClient: prisma,
    });

    console.log(
      JSON.stringify(
        {
          destinations,
          attractions,
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
