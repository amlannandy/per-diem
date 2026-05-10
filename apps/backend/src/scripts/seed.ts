/**
 * Seeds the Square sandbox with test catalog data.
 *
 * Prerequisites:
 *   1. Create exactly 2 active locations in the Square sandbox dashboard
 *      (Account & Settings → Locations)
 *   2. Copy .env.example → .env and fill in SQUARE_ACCESS_TOKEN
 *
 * Run with: pnpm seed
 *
 * Creates:
 *   - 4 categories: Burgers, Sides, Drinks, Desserts
 *   - 9 items with descriptions, prices, and images
 *   - 1 modifier list (Sauces) attached to burgers
 *   - Spicy Jalapeño Burger restricted to location 1 only (tests location filter)
 */

import 'dotenv/config';
import { randomUUID } from 'crypto';
import { initializeSquareClient } from '../services/square';

const client = initializeSquareClient();

async function getLocationIds(): Promise<[string, string]> {
  const response = await client.locations.list();
  const ids = (response.locations ?? [])
    .filter((l) => l.status === 'ACTIVE')
    .map((l) => l.id!);

  if (ids.length < 2) {
    throw new Error(
      `Found ${ids.length} location(s) — need at least 2. ` +
      'Create a second location in the Square sandbox dashboard first.'
    );
  }

  console.log(`Found ${ids.length} location(s): ${ids.join(', ')}`);
  return [ids[0], ids[1]];
}

async function uploadImage(label: string, objectId: string): Promise<void> {
  // picsum.photos provides consistent placeholder images per seed string
  const url = `https://picsum.photos/seed/${encodeURIComponent(label)}/800/600`;
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const blob = new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' });

  await client.catalog.images.create({
    request: {
      idempotencyKey: randomUUID(),
      objectId,
      isPrimary: true,
      image: {
        type: 'IMAGE',
        id: `#img-${label}`,
        imageData: { name: label },
      },
    },
    imageFile: blob,
  });

  console.log(`  ✓ Image uploaded: ${label}`);
}

async function seed() {
  const [loc1, loc2] = await getLocationIds();

  console.log('\nCreating catalog objects...');

  const batchResponse = await client.catalog.batchUpsert({
    idempotencyKey: randomUUID(),
    batches: [
      {
        objects: [
          // ---------------------------------------------------------------
          // Categories
          // ---------------------------------------------------------------
          {
            type: 'CATEGORY',
            id: '#cat-burgers',
            presentAtAllLocations: true,
            categoryData: { name: 'Burgers' },
          },
          {
            type: 'CATEGORY',
            id: '#cat-sides',
            presentAtAllLocations: true,
            categoryData: { name: 'Sides' },
          },
          {
            type: 'CATEGORY',
            id: '#cat-drinks',
            presentAtAllLocations: true,
            categoryData: { name: 'Drinks' },
          },
          {
            type: 'CATEGORY',
            id: '#cat-desserts',
            presentAtAllLocations: true,
            categoryData: { name: 'Desserts' },
          },

          // ---------------------------------------------------------------
          // Modifier list
          // ---------------------------------------------------------------
          {
            type: 'MODIFIER_LIST',
            id: '#mod-sauces',
            presentAtAllLocations: true,
            modifierListData: {
              name: 'Sauces',
              selectionType: 'MULTIPLE',
              modifiers: [
                {
                  type: 'MODIFIER',
                  id: '#mod-ketchup',
                  modifierData: { name: 'Ketchup', priceMoney: { amount: BigInt(0), currency: 'USD' } },
                },
                {
                  type: 'MODIFIER',
                  id: '#mod-mustard',
                  modifierData: { name: 'Mustard', priceMoney: { amount: BigInt(0), currency: 'USD' } },
                },
                {
                  type: 'MODIFIER',
                  id: '#mod-mayo',
                  modifierData: { name: 'Mayo', priceMoney: { amount: BigInt(50), currency: 'USD' } },
                },
                {
                  type: 'MODIFIER',
                  id: '#mod-bbq',
                  modifierData: { name: 'BBQ', priceMoney: { amount: BigInt(50), currency: 'USD' } },
                },
              ],
            },
          },

          // ---------------------------------------------------------------
          // Burgers — available at both locations
          // ---------------------------------------------------------------
          {
            type: 'ITEM',
            id: '#item-cheeseburger',
            presentAtAllLocations: true,
            itemData: {
              name: 'Classic Cheeseburger',
              description: 'Beef patty, cheddar cheese, lettuce, tomato, pickles, and onion on a brioche bun.',
              categoryId: '#cat-burgers',
              modifierListInfo: [{ modifierListId: '#mod-sauces', enabled: true }],
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-cheeseburger-single',
                  itemVariationData: { name: 'Single', priceMoney: { amount: BigInt(899), currency: 'USD' } },
                },
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-cheeseburger-double',
                  itemVariationData: { name: 'Double', priceMoney: { amount: BigInt(1199), currency: 'USD' } },
                },
              ],
            },
          },
          {
            type: 'ITEM',
            id: '#item-mushroom-burger',
            presentAtAllLocations: true,
            itemData: {
              name: 'Mushroom Swiss Burger',
              description: 'Beef patty, sautéed mushrooms, melted Swiss cheese, and garlic aioli.',
              categoryId: '#cat-burgers',
              modifierListInfo: [{ modifierListId: '#mod-sauces', enabled: true }],
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-mushroom-burger',
                  itemVariationData: { name: 'Regular', priceMoney: { amount: BigInt(1099), currency: 'USD' } },
                },
              ],
            },
          },
          {
            type: 'ITEM',
            id: '#item-veggie-burger',
            presentAtAllLocations: true,
            itemData: {
              name: 'Veggie Burger',
              description: 'Black bean patty, avocado, roasted peppers, and chipotle mayo.',
              categoryId: '#cat-burgers',
              modifierListInfo: [{ modifierListId: '#mod-sauces', enabled: true }],
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-veggie-burger',
                  itemVariationData: { name: 'Regular', priceMoney: { amount: BigInt(999), currency: 'USD' } },
                },
              ],
            },
          },
          // Only at loc1 — to test the location filter
          {
            type: 'ITEM',
            id: '#item-spicy-burger',
            presentAtAllLocations: false,
            presentAtLocationIds: [loc1],
            itemData: {
              name: 'Spicy Jalapeño Burger',
              description: 'Location exclusive. Beef patty, fresh jalapeños, pepper jack, and chipotle mayo.',
              categoryId: '#cat-burgers',
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-spicy-burger',
                  presentAtAllLocations: false,
                  presentAtLocationIds: [loc1],
                  itemVariationData: { name: 'Regular', priceMoney: { amount: BigInt(1149), currency: 'USD' } },
                },
              ],
            },
          },

          // ---------------------------------------------------------------
          // Sides — available at both locations
          // ---------------------------------------------------------------
          {
            type: 'ITEM',
            id: '#item-fries',
            presentAtAllLocations: true,
            itemData: {
              name: 'French Fries',
              description: 'Crispy golden fries seasoned with sea salt and served with house dipping sauce.',
              categoryId: '#cat-sides',
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-fries-sm',
                  itemVariationData: { name: 'Small', priceMoney: { amount: BigInt(299), currency: 'USD' } },
                },
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-fries-lg',
                  itemVariationData: { name: 'Large', priceMoney: { amount: BigInt(449), currency: 'USD' } },
                },
              ],
            },
          },
          {
            type: 'ITEM',
            id: '#item-onion-rings',
            presentAtAllLocations: true,
            itemData: {
              name: 'Onion Rings',
              description: 'Beer-battered onion rings, golden and crispy, served with ranch.',
              categoryId: '#cat-sides',
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-onion-rings',
                  itemVariationData: { name: 'Regular', priceMoney: { amount: BigInt(399), currency: 'USD' } },
                },
              ],
            },
          },

          // ---------------------------------------------------------------
          // Drinks — available at both locations
          // ---------------------------------------------------------------
          {
            type: 'ITEM',
            id: '#item-soda',
            presentAtAllLocations: true,
            itemData: {
              name: 'Fountain Soda',
              description: 'Choice of Coke, Diet Coke, Sprite, or Lemonade. Free refills.',
              categoryId: '#cat-drinks',
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-soda-sm',
                  itemVariationData: { name: 'Small', priceMoney: { amount: BigInt(199), currency: 'USD' } },
                },
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-soda-lg',
                  itemVariationData: { name: 'Large', priceMoney: { amount: BigInt(299), currency: 'USD' } },
                },
              ],
            },
          },
          {
            type: 'ITEM',
            id: '#item-milkshake',
            presentAtAllLocations: true,
            itemData: {
              name: 'Milkshake',
              description: 'Thick and creamy hand-spun shake. Chocolate, vanilla, or strawberry.',
              categoryId: '#cat-drinks',
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-milkshake',
                  itemVariationData: { name: 'Regular', priceMoney: { amount: BigInt(549), currency: 'USD' } },
                },
              ],
            },
          },

          // ---------------------------------------------------------------
          // Desserts — available at both locations
          // ---------------------------------------------------------------
          {
            type: 'ITEM',
            id: '#item-brownie',
            presentAtAllLocations: true,
            itemData: {
              name: 'Chocolate Brownie',
              description: 'Warm fudge brownie topped with vanilla ice cream and chocolate drizzle.',
              categoryId: '#cat-desserts',
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: '#var-brownie',
                  itemVariationData: { name: 'Regular', priceMoney: { amount: BigInt(499), currency: 'USD' } },
                },
              ],
            },
          },
        ],
      },
    ],
  });

  console.log(`Created ${batchResponse.objects?.length ?? 0} catalog objects.`);

  // idMappings resolves temp IDs (e.g. "#item-cheeseburger") → permanent Square IDs
  const idMappings = batchResponse.idMappings ?? [];
  const permId = (tempId: string) =>
    idMappings.find((m) => m.clientObjectId === tempId)?.objectId;

  // ---------------------------------------------------------------
  // Upload images for each item
  // ---------------------------------------------------------------
  console.log('\nUploading images...');

  const itemImages: [string, string][] = [
    ['#item-cheeseburger', 'cheeseburger'],
    ['#item-mushroom-burger', 'mushroom-burger'],
    ['#item-veggie-burger', 'veggie-burger'],
    ['#item-spicy-burger', 'spicy-burger'],
    ['#item-fries', 'french-fries'],
    ['#item-onion-rings', 'onion-rings'],
    ['#item-soda', 'soda-drink'],
    ['#item-milkshake', 'milkshake'],
    ['#item-brownie', 'chocolate-brownie'],
  ];

  for (const [tempId, imageLabel] of itemImages) {
    const objectId = permId(tempId);
    if (!objectId) {
      console.warn(`  ⚠ Could not find permanent ID for ${tempId}, skipping image.`);
      continue;
    }
    await uploadImage(imageLabel, objectId);
  }

  console.log(`
Done! Seeded:
  - 4 categories
  - 9 items (including 1 restricted to location ${loc1})
  - 9 images

To test location filtering: switch between locations in the app.
"Spicy Jalapeño Burger" should only appear at location ${loc1}.
  `);

  console.log(`Location 1: ${loc1}`);
  console.log(`Location 2: ${loc2}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
