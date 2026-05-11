import { motion } from 'motion/react';
import type { MenuCategory } from '@per-diem/types';

interface CategoryFilterProps {
  categories: MenuCategory[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className='flex gap-2 overflow-x-auto pb-1'>
      <motion.button
        onClick={() => onSelect(null)}
        animate={{
          backgroundColor: selectedId === null ? '#000000' : '#ffffff',
          color: selectedId === null ? '#ffffff' : '#4b5563',
          borderColor: selectedId === null ? '#000000' : '#e5e7eb',
        }}
        whileHover={
          selectedId !== null
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
        All
      </motion.button>

      {categories.map(category => {
        const isSelected = category.id === selectedId;
        return (
          <motion.button
            key={category.id}
            onClick={() => onSelect(category.id)}
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
            {category.name}
          </motion.button>
        );
      })}
    </div>
  );
}
