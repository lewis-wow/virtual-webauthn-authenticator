import { Buffer } from 'buffer';

export const toB64 = (bytes: Uint8Array | undefined): string | undefined => {
  if (bytes === undefined) {
    return undefined;
  }

  return Buffer.from(bytes).toString('base64url');
};
