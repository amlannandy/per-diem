import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import type { Location } from '@per-diem/types';

interface LocationSwitcherProps {
  locations: Location[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function LocationSwitcher({
  locations,
  selectedId,
  onSelect,
}: LocationSwitcherProps) {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <MapPin className='size-8' />
        <div>
          <h2 className='text-lg font-semibold'>Select Location</h2>
          <p className='text-sm text-gray-500'>
            Please select where you want to shop
          </p>
        </div>
      </div>
      <div className='flex gap-2 overflow-x-auto pb-1'>
        {locations.map(location => {
          const isSelected = location.id === selectedId;
          return (
            <motion.button
              key={location.id}
              onClick={() => onSelect(location.id)}
              animate={{
                backgroundColor: isSelected ? '#000000' : '#ffffff',
                color: isSelected ? '#ffffff' : '#4b5563',
                borderColor: isSelected ? '#000000' : '#e5e7eb',
              }}
              whileHover={
                !isSelected
                  ? {
                      backgroundColor: '#f3f4f6',
                      borderColor: '#111827',
                      color: '#111827',
                    }
                  : {}
              }
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className='shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium'>
              {location.name}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
