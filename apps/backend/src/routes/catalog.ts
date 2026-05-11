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

export function createCatalogRouter(client: SquareClient): IRouter {
  const router = Router();

  router.get('/', async (req, res) => {
    const locationId =
      typeof req.query.locationId === 'string'
        ? req.query.locationId
        : undefined;

    try {
      const page = await client.catalog.list({
        types: 'ITEM,CATEGORY,IMAGE,MODIFIER_LIST',
      });

      const objects: Square.CatalogObject[] = [];
      for await (const obj of page) {
        objects.push(obj);
      }

      // Build O(1) lookup maps before processing items.
      const imageUrlById = new Map<string, string>();
      const modifierListById = new Map<string, ModifierList>();
      const categoryObjects: Square.CatalogObject[] = [];

      for (const obj of objects) {
        if (obj.type === 'IMAGE' && obj.imageData?.url) {
          imageUrlById.set(obj.id, obj.imageData.url);
        }

        if (obj.type === 'CATEGORY') {
          categoryObjects.push(obj);
        }

        if (obj.type === 'MODIFIER_LIST' && obj.modifierListData) {
          const data = obj.modifierListData;

          const options: ModifierOption[] = (data.modifiers ?? [])
            .filter(
              (m): m is Square.CatalogObject & { type: 'MODIFIER' } =>
                m.type === 'MODIFIER',
            )
            .map(m => ({
              id: m.id,
              name: m.modifierData?.name ?? '',
              price: toMoney(m.modifierData?.priceMoney),
              isDefault: m.modifierData?.onByDefault ?? false,
            }));

          modifierListById.set(obj.id, {
            id: obj.id,
            name: data.name ?? '',
            // SINGLE = radio buttons, MULTIPLE = checkboxes
            selectionType:
              data.selectionType === 'SINGLE' ? 'SINGLE' : 'MULTIPLE',
            options,
          });
        }
      }

      // Map and filter items.
      const items: MenuItem[] = objects
        .filter(
          (obj): obj is Square.CatalogObject & { type: 'ITEM' } =>
            obj.type === 'ITEM',
        )
        .filter(obj => !locationId || isAvailableAtLocation(obj, locationId))
        .map(obj => {
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

          // Resolve modifier lists: only include those enabled for this item
          // and (when location-filtering) available at the selected location.
          const modifierLists: ModifierList[] = (data.modifierListInfo ?? [])
            .filter(info => info.enabled !== false)
            .filter(info => {
              if (!locationId || !info.modifierListId) return true;
              const mlObj = objects.find(o => o.id === info.modifierListId);
              return mlObj ? isAvailableAtLocation(mlObj, locationId) : false;
            })
            .flatMap(info => {
              const ml = modifierListById.get(info.modifierListId ?? '');
              return ml ? [ml] : [];
            });

          // Square items support multiple images; use the first for the menu card.
          const imageUrl = data.imageIds?.[0]
            ? (imageUrlById.get(data.imageIds[0]) ?? undefined)
            : undefined;

          return {
            id: obj.id,
            name: data.name ?? 'Unnamed Item',
            description: data.description ?? undefined,
            // categoryId is deprecated since 2023-12-13; categories[] is the current field
            categoryId: data.categories?.[0]?.id ?? data.categoryId ?? undefined,
            imageUrl,
            variations,
            modifierLists,
          };
        });

      // Drop categories that have no visible items after location filtering.
      const visibleCategoryIds = new Set(
        items.map(i => i.categoryId).filter((id): id is string => !!id),
      );

      const categories: MenuCategory[] = categoryObjects
        .filter(
          (obj): obj is Square.CatalogObject & { type: 'CATEGORY' } =>
            obj.type === 'CATEGORY',
        )
        .filter(obj => !!obj.id && visibleCategoryIds.has(obj.id))
        .map(obj => ({
          id: obj.id!,
          name: obj.categoryData?.name ?? 'Uncategorized',
          ordinal: Number(obj.ordinal ?? 0),
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
