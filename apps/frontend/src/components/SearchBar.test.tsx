import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders the input with placeholder', () => {
    render(<SearchBar value='' onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Search menu...')).toBeInTheDocument();
  });

  it('calls onChange as the user types', async () => {
    const onChange = vi.fn();
    render(<SearchBar value='' onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText('Search menu...'), 'burger');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows a clear button when value is non-empty and clears on click', async () => {
    const onChange = vi.fn();
    render(<SearchBar value='burger' onChange={onChange} />);
    const clearBtn = screen.getByRole('button');
    await userEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('does not show a clear button when value is empty', () => {
    render(<SearchBar value='' onChange={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
