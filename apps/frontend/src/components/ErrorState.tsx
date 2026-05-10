import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface Props {
  message?: string;
}

export function ErrorState({ message = 'Something went wrong' }: Props) {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <motion.div
        className='flex flex-col items-center gap-3 text-red-500'
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AlertCircle className='size-8' />
        <p className='text-sm font-medium'>{message}</p>
        <p className='text-xs text-gray-400'>Please check your connection and try again</p>
      </motion.div>
    </div>
  );
}
