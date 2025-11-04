import { bufferToUuid } from '../../src/bufferToUuid';
import { describe, it, expect } from 'vitest';

describe('bufferToUuid', () => {
  it('should convert a buffer to a UUID', () => {
    const buffer = Buffer.from('123e4567e89b12d3a456426614174000', 'hex');
    const result = bufferToUuid(buffer);
    expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');
  });
});
