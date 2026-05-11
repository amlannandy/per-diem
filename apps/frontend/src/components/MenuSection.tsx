import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import type { MenuItem } from '@per-diem/types';
import { MenuItemCard } from './MenuItemCard';

interface MenuSectionProps {
  title: string;
  isAvailableNow: boolean;
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}

export function MenuSection({
  title,
  isAvailableNow,
  items,
  onItemClick,
}: MenuSectionProps) {
  return (
    <section className={isAvailableNow ? '' : 'opacity-50'}>
      <div className='mb-3 flex items-center gap-2'>
        <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
        {!isAvailableNow && (
          <span className='flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500'>
            <Clock className='size-3' />
            Not available now
          </span>
        )}
      </div>
      <motion.div
        className='flex flex-col gap-3'
        initial='hidden'
        animate='visible'
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
        }}>
        {items.map(item => (
          <motion.div
            key={item.id}
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}>
            <MenuItemCard
              item={item}
              onClick={isAvailableNow ? onItemClick : () => {}}
              disabled={!isAvailableNow}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
