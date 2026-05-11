import { useState } from 'react';
import { useLocations } from './hooks/useLocations';
import { useCatalog } from './hooks/useCatalog';
import { LocationSwitcher } from './components/LocationSwitcher';
import { CategoryFilter } from './components/CategoryFilter';
import { SearchBar } from './components/SearchBar';
import { MenuSection } from './components/MenuSection';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { ItemDetailModal } from './components/ItemDetailModal';
import type { MenuItem } from '@per-diem/types';

export default function App() {
  const { data: locations, isPending: locationsPending, isError: locationsError } = useLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const activeLocation = locations?.find((l) => l.id === selectedLocationId) ?? locations?.[0] ?? null;
  const activeLocationId = activeLocation?.id ?? null;
  const activeTimezone = activeLocation?.timezone ?? null;

  const { data: catalog, isPending: catalogPending, isError: catalogError } = useCatalog(
    activeLocationId,
    activeTimezone,
  );

  if (locationsPending) return <LoadingState message='Loading locations...' />;
  if (locationsError || !locations?.length) return <ErrorState message='Failed to load locations' />;

  const visibleItems = (catalog?.items ?? []).filter((item) => {
    const matchesCategory = !selectedCategoryId || item.categoryId === selectedCategoryId;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleCategories = catalog?.categories ?? [];

  const groupedItems = visibleCategories
    .map((category) => ({
      category,
      items: visibleItems.filter((item) => item.categoryId === category.id),
    }))
    .filter(({ items }) => items.length > 0);

  const uncategorised = visibleItems.filter((item) => !item.categoryId);

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold'>Per Diem</h1>

      <div className='space-y-8'>
        <LocationSwitcher
          locations={locations}
          selectedId={activeLocationId!}
          onSelect={(id) => {
            setSelectedLocationId(id);
            setSelectedCategoryId(null);
            setSearchQuery('');
          }}
        />

        {catalogPending && <LoadingState message='Loading menu...' />}
        {catalogError && <ErrorState message='Failed to load menu' />}

        {catalog && (
          <div className='space-y-6'>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            <CategoryFilter
              categories={visibleCategories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />

            <div className='space-y-8'>
              {groupedItems.map(({ category, items }) => (
                <MenuSection
                  key={category.id}
                  title={category.name}
                  isAvailableNow={category.isAvailableNow}
                  items={items}
                  onItemClick={setSelectedItem}
                />
              ))}

              {uncategorised.length > 0 && (
                <MenuSection
                  title='Other'
                  isAvailableNow={true}
                  items={uncategorised}
                  onItemClick={setSelectedItem}
                />
              )}

              {visibleItems.length === 0 && (
                <p className='py-12 text-center text-gray-400'>
                  {searchQuery ? `No results for "${searchQuery}"` : 'No items available.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
