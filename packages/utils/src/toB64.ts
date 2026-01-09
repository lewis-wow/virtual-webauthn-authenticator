import type { Uint8Array_ } from '@repo/types';
import { Buffer } from 'buffer';

export const toB64 = (bytes: Uint8Array_ | undefined): string | undefined => {
  if (bytes === undefined) {
    return undefined;
  }

  return Buffer.from(bytes).toString('base64url');
};
