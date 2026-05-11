export function MenuSkeleton() {
  return (
    <div className='space-y-6 animate-pulse'>
      {/* Category filter pills */}
      <div className='flex gap-2 overflow-hidden'>
        {[80, 64, 96, 72].map((w, i) => (
          <div
            key={i}
            className='h-8 shrink-0 rounded-full bg-gray-100'
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Item cards */}
      <div className='space-y-8'>
        {[3, 2].map((count, sectionIdx) => (
          <div key={sectionIdx} className='space-y-3'>
            {/* Section heading */}
            <div className='h-5 w-24 rounded-md bg-gray-100' />
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4'
              >
                {/* Image placeholder */}
                <div className='size-20 shrink-0 rounded-lg bg-gray-100' />
                {/* Text lines */}
                <div className='flex-1 space-y-2'>
                  <div className='h-4 w-3/4 rounded bg-gray-100' />
                  <div className='h-3 w-full rounded bg-gray-100' />
                  <div className='h-3 w-1/2 rounded bg-gray-100' />
                  <div className='h-4 w-16 rounded bg-gray-100' />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
