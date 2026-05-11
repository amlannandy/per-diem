import { motion } from 'motion/react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <motion.div
        className='flex flex-col items-center gap-4 text-center'
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className='flex size-14 items-center justify-center rounded-full bg-red-50'>
          <AlertCircle className='size-7 text-red-500' />
        </div>
        <div>
          <p className='font-medium text-gray-900'>{message}</p>
          <p className='mt-1 text-sm text-gray-400'>Please check your connection and try again</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className='flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900'
          >
            <RefreshCw className='size-4' />
            Try again
          </button>
        )}
      </motion.div>
    </div>
  );
}
