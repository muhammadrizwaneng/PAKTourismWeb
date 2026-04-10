import { importKpTopDestinations } from '../src/lib/kp-destinations';

async function main() {
  const result = await importKpTopDestinations({
    limit: 10,
    maxPages: 50,
  });

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
