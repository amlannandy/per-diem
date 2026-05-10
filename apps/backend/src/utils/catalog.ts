import { Money } from '@per-diem/types';
import { Square } from 'square';

// Square returns money amounts as BigInt. JSON.stringify throws on BigInt,
// so we must convert to Number before sending any response.
export function toMoney(raw?: {
  amount?: bigint | null;
  currency?: string | null;
}): Money | undefined {
  if (!raw?.currency) return undefined;
  return { amount: Number(raw.amount ?? 0), currency: raw.currency };
}

/**
 * Availability logic:
 * - absentAtLocationIds takes highest precedence (always excluded)
 * - presentAtAllLocations defaults to true when unset
 * - When presentAtAllLocations is explicitly false, only presentAtLocationIds are included
 */
export function isAvailableAtLocation(
  obj: Pick<
    Square.CatalogObjectBase,
    'presentAtAllLocations' | 'presentAtLocationIds' | 'absentAtLocationIds'
  >,
  locationId: string,
): boolean {
  if (obj.absentAtLocationIds?.includes(locationId)) return false;
  if (obj.presentAtAllLocations !== false) return true;
  return obj.presentAtLocationIds?.includes(locationId) ?? false;
}
