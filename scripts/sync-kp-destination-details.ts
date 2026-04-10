import { syncKpDestinationDetails } from '../src/lib/kp-destinations';

async function main() {
  const destinationSlug = process.argv[2];

  const result = await syncKpDestinationDetails({
    destinationSlug,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
