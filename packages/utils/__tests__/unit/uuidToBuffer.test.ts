import { describe, it, expect } from 'vitest';

import { uuidToBytes } from '../../src/uuidToBytes';

describe('uuidToBytes', () => {
  it('should convert a UUID to a buffer', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const result = uuidToBytes(uuid);
    expect(result).toEqual(
      Buffer.from('123e4567e89b12d3a456426614174000', 'hex'),
    );
  });
});
