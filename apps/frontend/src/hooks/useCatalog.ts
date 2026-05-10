import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ApiResponse, CatalogResponse } from '@per-diem/types';

async function fetchCatalog(locationId: string): Promise<CatalogResponse> {
  const { data } = await api.get<ApiResponse<CatalogResponse>>('/catalog', {
    params: { locationId },
  });
  return data.data;
}

export function useCatalog(locationId: string | null) {
  return useQuery({
    queryKey: ['catalog', locationId],
    queryFn: () => fetchCatalog(locationId!),
    enabled: !!locationId,
  });
}
