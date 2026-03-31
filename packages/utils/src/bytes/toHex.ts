import type { Uint8Array_ } from '@repo/types';

export const toHex = (input: Uint8Array_): string => {
  const bytes =
    typeof input === 'string' ? new TextEncoder().encode(input) : input;
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};
