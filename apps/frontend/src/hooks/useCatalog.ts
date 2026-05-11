import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ApiResponse, CatalogResponse } from '@per-diem/types';

async function fetchCatalog(
  locationId: string,
  timezone: string,
): Promise<CatalogResponse> {
  const { data } = await api.get<ApiResponse<CatalogResponse>>('/catalog', {
    params: { locationId, timezone },
  });
  return data.data;
}

export function useCatalog(locationId: string | null, timezone: string | null) {
  return useQuery({
    queryKey: ['catalog', locationId, timezone],
    queryFn: () => fetchCatalog(locationId!, timezone!),
    enabled: !!locationId && !!timezone,
  });
}
