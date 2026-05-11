import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className='relative'>
      <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
      <input
        type='text'
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder='Search menu...'
        className='w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-gray-900'
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600'>
          <X className='size-4' />
        </button>
      )}
    </div>
  );
}
