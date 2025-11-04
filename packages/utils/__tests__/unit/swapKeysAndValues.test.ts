import { swapKeysAndValues } from '../../src/swapKeysAndValues';
import { describe, it, expect } from 'vitest';

describe('swapKeysAndValues', () => {
  it('should swap keys and values', () => {
    const obj = {
      a: '1',
      b: '2',
    };
    const result = swapKeysAndValues(obj);
    expect(result).toEqual({
      '1': 'a',
      '2': 'b',
    });
  });

  it('should handle an empty object', () => {
    const obj = {};
    const result = swapKeysAndValues(obj);
    expect(result).toEqual({});
  });
});
