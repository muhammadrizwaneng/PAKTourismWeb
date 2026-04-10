import { importKpTopAttractions } from '../src/lib/kp-attractions';

async function main() {
  const result = await importKpTopAttractions({
    limit: 12,
    maxPages: 50,
  });

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
