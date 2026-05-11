import { motion, AnimatePresence } from 'motion/react';
import { X, ImageOff } from 'lucide-react';
import type { MenuItem } from '@per-diem/types';
import { formatPrice } from '../utils/format';

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            className='fixed inset-0 z-40 bg-black/40 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className='fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-white sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:rounded-2xl'
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
            {/* Drag handle */}
            <div className='flex justify-center pt-3 pb-1'>
              <div className='h-1 w-10 rounded-full bg-gray-200' />
            </div>

            {/* Close button */}
            <div className='flex justify-end px-4 pt-2'>
              <button
                onClick={onClose}
                className='cursor-pointer rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600'>
                <X className='size-5' />
              </button>
            </div>

            <div className='px-4 pb-10 space-y-6'>
              {/* Name */}
              <h2 className='text-xl font-bold text-gray-900'>{item.name}</h2>

              {/* Image */}
              <div className='aspect-video w-full overflow-hidden rounded-xl bg-gray-100'>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className='size-full object-cover'
                  />
                ) : (
                  <div className='flex size-full items-center justify-center'>
                    <ImageOff className='size-10 text-gray-300' />
                  </div>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p className='text-sm leading-relaxed text-gray-500'>
                  {item.description}
                </p>
              )}

              {/* Variations */}
              {item.variations.length > 0 && (
                <div>
                  <h3 className='mb-3 font-semibold text-gray-900'>
                    {item.variations.length === 1 ? 'Price' : 'Options'}
                  </h3>
                  <div className='space-y-2'>
                    {item.variations.map(variation => (
                      <div
                        key={variation.id}
                        className='flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3'>
                        <span className='text-sm text-gray-700'>
                          {variation.name}
                        </span>
                        {variation.price && (
                          <span className='text-sm font-semibold text-gray-900'>
                            {formatPrice(
                              variation.price.amount,
                              variation.price.currency,
                            )}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modifier lists */}
              {item.modifierLists.map(list => (
                <div key={list.id}>
                  <div className='mb-3 flex items-center gap-2'>
                    <h3 className='font-semibold text-gray-900'>{list.name}</h3>
                    <span className='text-xs text-gray-400'>
                      {list.selectionType === 'SINGLE'
                        ? 'Pick one'
                        : 'Pick many'}
                    </span>
                  </div>
                  <div className='space-y-2'>
                    {list.options.map(option => (
                      <div
                        key={option.id}
                        className='flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3'>
                        <span className='text-sm text-gray-700'>
                          {option.name}
                        </span>
                        {option.price && option.price.amount > 0 && (
                          <span className='text-sm text-gray-500'>
                            +
                            {formatPrice(
                              option.price.amount,
                              option.price.currency,
                            )}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
