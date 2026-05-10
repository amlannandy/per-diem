export interface LocationAddress {
  addressLine1?: string;
  locality?: string;
  administrativeDistrictLevel1?: string;
  postalCode?: string;
  country?: string;
}

export interface Location {
  id: string;
  name: string;
  /** IANA timezone string — needed by the frontend for time-of-day availability checks */
  timezone: string;
  currency: string;
  address?: LocationAddress;
}
