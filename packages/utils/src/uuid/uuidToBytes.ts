import type { Uint8Array_ } from '@repo/types';

export const uuidToBytes = (uuid: string): Uint8Array_ => {
  return new Uint8Array(Buffer.from(uuid.replace(/-/g, ''), 'hex'));
};
