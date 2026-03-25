import type { Uint8Array_ } from '@repo/types';

export const toBase64 = (input: Uint8Array_) => {
  const bytes =
      typeof input === 'string' ? new TextEncoder().encode(input) : input,
    binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');

  return btoa(binString);
};
