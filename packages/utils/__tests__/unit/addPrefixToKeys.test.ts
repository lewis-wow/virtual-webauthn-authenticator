import { addPrefixToKeys } from '../../src/addPrefixToKeys';
import { describe, it, expect } from 'vitest';

describe('addPrefixToKeys', () => {
  it('should add a prefix to each key in the object', () => {
    const obj = {
      a: 1,
      b: 2,
    };
    const prefix = 'prefix_';
    const result = addPrefixToKeys(obj, prefix);
    expect(result).toEqual({
      prefix_a: 1,
      prefix_b: 2,
    });
  });

  it('should handle an empty object', () => {
    const obj = {};
    const prefix = 'prefix_';
    const result = addPrefixToKeys(obj, prefix);
    expect(result).toEqual({});
  });

  it('should handle a prefix that is an empty string', () => {
    const obj = {
      a: 1,
      b: 2,
    };
    const prefix = '';
    const result = addPrefixToKeys(obj, prefix);
    expect(result).toEqual({
      a: 1,
      b: 2,
    });
  });
});
