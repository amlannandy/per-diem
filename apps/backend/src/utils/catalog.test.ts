import { describe, it, expect } from 'vitest';
import { toMoney, isAvailableAtLocation } from './catalog';

describe('toMoney', () => {
  it('returns undefined when currency is missing', () => {
    expect(toMoney({ amount: BigInt(100) })).toBeUndefined();
    expect(toMoney(undefined)).toBeUndefined();
    expect(toMoney({})).toBeUndefined();
  });

  it('converts BigInt amount to number', () => {
    expect(toMoney({ amount: BigInt(1299), currency: 'USD' })).toEqual({
      amount: 1299,
      currency: 'USD',
    });
  });

  it('defaults amount to 0 when null', () => {
    expect(toMoney({ amount: null, currency: 'USD' })).toEqual({
      amount: 0,
      currency: 'USD',
    });
  });
});

describe('isAvailableAtLocation', () => {
  const LOC = 'loc-1';
  const OTHER = 'loc-2';

  it('is available when presentAtAllLocations is true', () => {
    expect(isAvailableAtLocation({ presentAtAllLocations: true }, LOC)).toBe(true);
  });

  it('is available when no fields are set (defaults to present everywhere)', () => {
    expect(isAvailableAtLocation({}, LOC)).toBe(true);
  });

  it('is NOT available when location is in absentAtLocationIds', () => {
    expect(
      isAvailableAtLocation(
        { presentAtAllLocations: true, absentAtLocationIds: [LOC] },
        LOC,
      ),
    ).toBe(false);
  });

  it('absent list takes precedence even with presentAtLocationIds set', () => {
    expect(
      isAvailableAtLocation(
        {
          presentAtAllLocations: false,
          presentAtLocationIds: [LOC],
          absentAtLocationIds: [LOC],
        },
        LOC,
      ),
    ).toBe(false);
  });

  it('is available when presentAtAllLocations is false but location is in presentAtLocationIds', () => {
    expect(
      isAvailableAtLocation(
        { presentAtAllLocations: false, presentAtLocationIds: [LOC, OTHER] },
        LOC,
      ),
    ).toBe(true);
  });

  it('is NOT available when presentAtAllLocations is false and location is not in presentAtLocationIds', () => {
    expect(
      isAvailableAtLocation(
        { presentAtAllLocations: false, presentAtLocationIds: [OTHER] },
        LOC,
      ),
    ).toBe(false);
  });

  it('is NOT available when presentAtAllLocations is false and presentAtLocationIds is empty', () => {
    expect(
      isAvailableAtLocation(
        { presentAtAllLocations: false, presentAtLocationIds: [] },
        LOC,
      ),
    ).toBe(false);
  });
});
