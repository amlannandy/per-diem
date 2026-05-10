/** Money is always in the smallest currency unit (cents for USD) */
export interface Money {
  amount: number;
  currency: string;
}

export interface ItemVariation {
  id: string;
  name: string;
  price?: Money;
  ordinal: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  price?: Money;
  isDefault: boolean;
}

export interface ModifierList {
  id: string;
  name: string;
  /** SINGLE = radio, MULTIPLE = checkboxes */
  selectionType: 'SINGLE' | 'MULTIPLE';
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  imageUrl?: string;
  variations: ItemVariation[];
  modifierLists: ModifierList[];
}

export interface MenuCategory {
  id: string;
  name: string;
  ordinal: number;
}

export interface CatalogResponse {
  categories: MenuCategory[];
  items: MenuItem[];
}
