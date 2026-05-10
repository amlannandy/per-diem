import { Location } from '@per-diem/types';
import { Square } from 'square';

export const transformLocationFromApiToModel = (
  loc: Square.Location,
): Location => ({
  id: loc.id!,
  name: loc.name ?? 'Unknown',
  timezone: loc.timezone ?? 'America/New_York',
  currency: loc.currency ?? 'USD',
  address: loc.address
    ? {
        addressLine1: loc.address.addressLine1 ?? undefined,
        locality: loc.address.locality ?? undefined,
        administrativeDistrictLevel1:
          loc.address.administrativeDistrictLevel1 ?? undefined,
        postalCode: loc.address.postalCode ?? undefined,
        country: loc.address.country ?? undefined,
      }
    : undefined,
});
