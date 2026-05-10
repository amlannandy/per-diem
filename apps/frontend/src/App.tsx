import { useState } from 'react';
import { useLocations } from './hooks/useLocations';
import { LocationSwitcher } from './components/LocationSwitcher';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

export default function App() {
  const { data: locations, isPending, isError } = useLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );

  const activeLocationId = selectedLocationId ?? locations?.[0]?.id ?? null;

  if (isPending) {
    return <LoadingState message='Loading locations...' />;
  }

  if (isError || !locations?.length) {
    return <ErrorState message='Failed to load locations' />;
  }

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold'>Per Diem</h1>
      <LocationSwitcher
        locations={locations}
        selectedId={activeLocationId!}
        onSelect={setSelectedLocationId}
      />
    </div>
  );
}
