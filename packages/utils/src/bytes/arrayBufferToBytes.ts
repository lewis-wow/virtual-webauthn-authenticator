import type { Uint8Array_ } from '@repo/types';

export const arrayBufferToBytes = (arrayBuffer: ArrayBuffer): Uint8Array_ => {
  return new Uint8Array(arrayBuffer);
};
