import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ApiResponse, Location } from '@per-diem/types';

async function fetchLocations(): Promise<Location[]> {
  const { data } = await api.get<ApiResponse<Location[]>>('/locations');
  return data.data;
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });
}
