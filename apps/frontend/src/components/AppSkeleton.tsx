import { MenuSkeleton } from './MenuSkeleton';

export function AppSkeleton() {
  return (
    <div className='mx-auto max-w-3xl px-4 py-8 animate-pulse'>
      {/* Header */}
      <div className='mb-6 h-8 w-32 rounded-md bg-gray-100' />

      {/* Location switcher */}
      <div className='space-y-3 mb-8'>
        <div className='h-5 w-36 rounded-md bg-gray-100' />
        <div className='h-3 w-52 rounded-md bg-gray-100' />
        <div className='flex gap-2'>
          {[96, 72, 88].map((w, i) => (
            <div key={i} className='h-8 shrink-0 rounded-full bg-gray-100' style={{ width: w }} />
          ))}
        </div>
      </div>

      <MenuSkeleton />
    </div>
  );
}
