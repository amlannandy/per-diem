import { motion } from 'motion/react';
import { ImageOff } from 'lucide-react';
import type { MenuItem } from '@per-diem/types';
import { formatPrice } from '../utils/format';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
  disabled?: boolean;
}

export function MenuItemCard({
  item,
  onClick,
  disabled = false,
}: MenuItemCardProps) {
  const lowestPrice = item.variations
    .filter(v => v.price)
    .sort((a, b) => a.price!.amount - b.price!.amount)[0]?.price;

  return (
    <motion.button
      onClick={() => !disabled && onClick(item)}
      whileHover={
        !disabled ? { y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' } : {}
      }
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
      className={`flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 text-left ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className='size-20 shrink-0 overflow-hidden rounded-lg bg-gray-100'>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className='size-full object-cover'
          />
        ) : (
          <div className='flex size-full items-center justify-center'>
            <ImageOff className='size-6 text-gray-300' />
          </div>
        )}
      </div>

      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium text-gray-900'>{item.name}</p>
        {item.description && (
          <p className='mt-0.5 line-clamp-2 text-sm text-gray-500'>
            {item.description}
          </p>
        )}
        {lowestPrice && (
          <p className='mt-1.5 text-sm font-semibold text-gray-900'>
            {formatPrice(lowestPrice.amount, lowestPrice.currency)}
          </p>
        )}
      </div>
    </motion.button>
  );
}
