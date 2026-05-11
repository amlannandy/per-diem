import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationSwitcher } from './LocationSwitcher';
import type { Location } from '@per-diem/types';

const locations: Location[] = [
  { id: 'loc-1', name: 'Mumbai', timezone: 'Asia/Kolkata', currency: 'USD' },
  { id: 'loc-2', name: 'Delhi', timezone: 'Asia/Kolkata', currency: 'USD' },
];

describe('LocationSwitcher', () => {
  it('renders all location names', () => {
    render(
      <LocationSwitcher locations={locations} selectedId='loc-1' onSelect={() => {}} />,
    );
    expect(screen.getByText('Mumbai')).toBeInTheDocument();
    expect(screen.getByText('Delhi')).toBeInTheDocument();
  });

  it('calls onSelect with the location id when clicked', async () => {
    const onSelect = vi.fn();
    render(
      <LocationSwitcher locations={locations} selectedId='loc-1' onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByText('Delhi'));
    expect(onSelect).toHaveBeenCalledWith('loc-2');
  });
});
