import type { Uint8Array_ } from '@repo/types';
import { Buffer } from 'buffer';

export const fromB64url = (
  b64url: string | undefined,
): Uint8Array_ | undefined => {
  if (b64url === undefined) {
    return undefined;
  }

  return new Uint8Array(Buffer.from(b64url, 'base64url'));
};
