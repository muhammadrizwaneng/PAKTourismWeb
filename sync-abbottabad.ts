import { syncKpDestinationDetails } from './src/lib/kp-destinations';
import { prisma } from './src/lib/db';

async function main() {
  console.log("Re-syncing Abbottabad specifically to process 40+ gallery items...");
  const res = await syncKpDestinationDetails({ destinationLimit: 50, maxPages: 10, destinationSlug: 'abbottabad-devsg' });
  console.log("Done syncing details:", res);
}

main().catch(console.error).finally(() => prisma.$disconnect());
