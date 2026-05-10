import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface Props {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: Props) {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <motion.div
        className='flex flex-col items-center gap-3 text-gray-400'
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Loader2 className='size-8 animate-spin' />
        <p className='text-sm'>{message}</p>
      </motion.div>
    </div>
  );
}
