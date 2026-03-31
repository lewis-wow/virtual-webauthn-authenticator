import type { Uint8Array_ } from '@repo/types';

export const fromHex = (hex: string): Uint8Array_ => {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const length = Math.floor(cleanHex.length / 2);

  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    const high = parseInt(cleanHex[i * 2]!, 16);
    const low = parseInt(cleanHex[i * 2 + 1]!, 16);
    bytes[i] = (high << 4) | low;
  }

  return bytes;
};
