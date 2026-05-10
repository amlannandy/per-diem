import { Router, type IRouter } from 'express';
import { type SquareClient } from 'square';
import type { ApiResponse, Location, ApiError } from '@per-diem/types';
import { transformLocationFromApiToModel } from '../utils/location';

/** GET /api/locations — returns all ACTIVE Square locations */
export function createLocationsRouter(client: SquareClient): IRouter {
  const router = Router();

  router.get('/', async (_req, res) => {
    try {
      const response = await client.locations.list();

      const locations: Location[] = (response.locations ?? [])
        .filter(location => location.status === 'ACTIVE')
        .map(location => transformLocationFromApiToModel(location));

      const body: ApiResponse<Location[]> = {
        data: locations,
        success: true,
      };
      res.json(body);
    } catch (err) {
      const response: ApiError = {
        error: 'Failed to fetch locations',
        success: false,
      };
      res.status(500).json(response);
    }
  });

  return router;
}
