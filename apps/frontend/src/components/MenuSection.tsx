import { motion } from 'motion/react';
import type { MenuItem } from '@per-diem/types';
import { MenuItemCard } from './MenuItemCard';

interface Props {
  title: string;
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}

export function MenuSection({ title, items, onItemClick }: Props) {
  return (
    <section>
      <h2 className='mb-3 text-lg font-semibold text-gray-900'>{title}</h2>
      <motion.div
        className='flex flex-col gap-3'
        initial='hidden'
        animate='visible'
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <MenuItemCard item={item} onClick={onItemClick} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
