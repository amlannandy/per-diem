/**
 * Deletes all catalog objects from the Square sandbox.
 * Run with: pnpm clear
 */

import 'dotenv/config';
import { initializeSquareClient } from '../services/square';

const client = initializeSquareClient();

async function clear() {
  console.log('Fetching all catalog objects...');

  const objects: string[] = [];

  const page = await client.catalog.list();
  for await (const obj of page) {
    if (obj.id) objects.push(obj.id);
  }

  if (objects.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  console.log(`Deleting ${objects.length} objects...`);

  await client.catalog.batchDelete({ objectIds: objects });

  console.log('Done. Catalog is now empty.');
}

clear().catch((err) => {
  console.error('Clear failed:', err);
  process.exit(1);
});
