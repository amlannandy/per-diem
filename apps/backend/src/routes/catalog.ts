import { Router, type IRouter } from 'express';
import { SquareError, type SquareClient } from 'square';
import type { Square } from 'square';
import type {
  ApiResponse,
  CatalogResponse,
  MenuCategory,
  MenuItem,
  ModifierList,
  ModifierOption,
  ItemVariation,
  ApiError,
} from '@per-diem/types';
import { isAvailableAtLocation, toMoney } from '../utils/catalog';

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
function isCategoryAvailableNow(
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

  const weekdayAbbr = parts.find((p) => p.type === 'weekday')?.value ?? '';
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  // Normalise "24:xx" midnight edge case and build comparable HH:MM:00 string
  const currentTime = `${hour === '24' ? '00' : hour}:${minute}:00`;

  const dayMap: Record<string, string> = {
    Mon: 'MON', Tue: 'TUE', Wed: 'WED',
    Thu: 'THU', Fri: 'FRI', Sat: 'SAT', Sun: 'SUN',
  };
  const today = dayMap[weekdayAbbr];

  return periodIds.some((id) => {
    const period = periodsById.get(id);
    if (!period || period.dayOfWeek !== today) return false;
    return (
      currentTime >= (period.startLocalTime ?? '00:00:00') &&
      currentTime <= (period.endLocalTime ?? '23:59:59')
    );
  });
}

export function createCatalogRouter(client: SquareClient): IRouter {
  const router = Router();

  router.get('/', async (req, res) => {
    const locationId =
      typeof req.query.locationId === 'string' ? req.query.locationId : undefined;
    const timezone =
      typeof req.query.timezone === 'string' ? req.query.timezone : 'America/New_York';

    try {
      const page = await client.catalog.list({
        types: 'ITEM,CATEGORY,IMAGE,MODIFIER_LIST,AVAILABILITY_PERIOD',
      });

      const objects: Square.CatalogObject[] = [];
      for await (const obj of page) {
        objects.push(obj);
      }

      // Build O(1) lookup maps in a single pass.
      const imageUrlById = new Map<string, string>();
      const modifierListById = new Map<string, ModifierList>();
      const availabilityPeriodsById = new Map<string, Square.CatalogAvailabilityPeriod>();
      const categoryObjects: Square.CatalogObject[] = [];

      for (const obj of objects) {
        if (obj.type === 'IMAGE' && obj.imageData?.url) {
          imageUrlById.set(obj.id, obj.imageData.url);
        }
        if (obj.type === 'CATEGORY') {
          categoryObjects.push(obj);
        }
        if (obj.type === 'AVAILABILITY_PERIOD' && obj.availabilityPeriodData) {
          availabilityPeriodsById.set(obj.id, obj.availabilityPeriodData);
        }
        if (obj.type === 'MODIFIER_LIST' && obj.modifierListData) {
          const data = obj.modifierListData;
          const options: ModifierOption[] = (data.modifiers ?? [])
            .filter((m): m is Square.CatalogObject & { type: 'MODIFIER' } => m.type === 'MODIFIER')
            .map((m) => ({
              id: m.id,
              name: m.modifierData?.name ?? '',
              price: toMoney(m.modifierData?.priceMoney),
              isDefault: m.modifierData?.onByDefault ?? false,
            }));
          modifierListById.set(obj.id, {
            id: obj.id,
            name: data.name ?? '',
            selectionType: data.selectionType === 'SINGLE' ? 'SINGLE' : 'MULTIPLE',
            options,
          });
        }
      }

      // Map and filter items by location availability.
      const items: MenuItem[] = objects
        .filter((obj): obj is Square.CatalogObject & { type: 'ITEM' } => obj.type === 'ITEM')
        .filter((obj) => !locationId || isAvailableAtLocation(obj, locationId))
        .map((obj) => {
          const data = obj.itemData!;

          const variations: ItemVariation[] = (data.variations ?? [])
            .filter(
              (v): v is Square.CatalogObject & { type: 'ITEM_VARIATION' } =>
                v.type === 'ITEM_VARIATION',
            )
            .map((v, idx) => ({
              id: v.id,
              name: v.itemVariationData?.name ?? 'Default',
              price: toMoney(v.itemVariationData?.priceMoney),
              ordinal: v.itemVariationData?.ordinal ?? idx,
            }));

          const modifierLists: ModifierList[] = (data.modifierListInfo ?? [])
            .filter((info) => info.enabled !== false)
            .filter((info) => {
              if (!locationId || !info.modifierListId) return true;
              const mlObj = objects.find((o) => o.id === info.modifierListId);
              return mlObj ? isAvailableAtLocation(mlObj, locationId) : false;
            })
            .flatMap((info) => {
              const ml = modifierListById.get(info.modifierListId ?? '');
              return ml ? [ml] : [];
            });

          const imageUrl = data.imageIds?.[0]
            ? (imageUrlById.get(data.imageIds[0]) ?? undefined)
            : undefined;

          return {
            id: obj.id,
            name: data.name ?? 'Unnamed Item',
            description: data.description ?? undefined,
            // categoryId deprecated since 2023-12-13; categories[] is the current field
            categoryId: data.categories?.[0]?.id ?? data.categoryId ?? undefined,
            imageUrl,
            variations,
            modifierLists,
          };
        });

      const visibleCategoryIds = new Set(
        items.map((i) => i.categoryId).filter((id): id is string => !!id),
      );

      const categories: MenuCategory[] = categoryObjects
        .filter((obj): obj is Square.CatalogObject & { type: 'CATEGORY' } => obj.type === 'CATEGORY')
        .filter((obj) => !!obj.id && visibleCategoryIds.has(obj.id))
        .map((obj) => ({
          id: obj.id!,
          name: obj.categoryData?.name ?? 'Uncategorized',
          ordinal: Number(obj.ordinal ?? 0),
          isAvailableNow: isCategoryAvailableNow(
            obj.categoryData?.availabilityPeriodIds ?? [],
            availabilityPeriodsById,
            timezone,
          ),
        }))
        .sort((a, b) => a.ordinal - b.ordinal);

      const body: ApiResponse<CatalogResponse> = {
        data: { categories, items },
        success: true,
      };
      res.json(body);
    } catch (err) {
      const response: ApiError = {
        error: 'Failed to fetch catalog',
        success: false,
      };
      res.status(500).json(response);
    }
  });

  return router;
}
