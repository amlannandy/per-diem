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

/**
 * Check whether a category is currently orderable based on its availability periods.
 *
 * Square's model: availability periods live on the category, not the item.
 * A category with no periods is always available.
 * A category with periods is only available when the current local time (in the
 * location's timezone) falls within at least one matching period.
 *
 * We chose category-level checking over item-level because that is how Square's
 * API exposes scheduled availability — CatalogAvailabilityPeriod.availabilityPeriodIds
 * is a field on CatalogCategory, not CatalogItem.
 */
export function isCategoryAvailableNow(
  periodIds: string[],
  periodsById: Map<string, Square.CatalogAvailabilityPeriod>,
  timezone: string,
): boolean {
  if (!periodIds.length) return true;

  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const weekdayAbbr = parts.find(p => p.type === 'weekday')?.value ?? '';
  const hour = parts.find(p => p.type === 'hour')?.value ?? '00';
  const minute = parts.find(p => p.type === 'minute')?.value ?? '00';
  // Normalise "24:xx" midnight edge case and build comparable HH:MM:00 string
  const currentTime = `${hour === '24' ? '00' : hour}:${minute}:00`;

  const dayMap: Record<string, string> = {
    Mon: 'MON',
    Tue: 'TUE',
    Wed: 'WED',
    Thu: 'THU',
    Fri: 'FRI',
    Sat: 'SAT',
    Sun: 'SUN',
  };
  const today = dayMap[weekdayAbbr];

  return periodIds.some(id => {
    const period = periodsById.get(id);
    if (!period || period.dayOfWeek !== today) return false;
    return (
      currentTime >= (period.startLocalTime ?? '00:00:00') &&
      currentTime <= (period.endLocalTime ?? '23:59:59')
    );
  });
}
