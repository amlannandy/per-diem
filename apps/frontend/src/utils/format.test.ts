import { describe, it, expect } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats cents as a USD currency string', () => {
    expect(formatPrice(1299, 'USD')).toBe('$12.99');
  });

  it('formats zero cents', () => {
    expect(formatPrice(0, 'USD')).toBe('$0.00');
  });

  it('formats whole dollar amounts', () => {
    expect(formatPrice(500, 'USD')).toBe('$5.00');
  });
});
