import type { Uint8Array_ } from '@repo/types';

import { fromBase64 } from './fromBase64';

export const fromBase64Url = (base64Url: string): Uint8Array_ => {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  // Restore padding if necessary
  while (base64.length % 4) {
    base64 += '=';
  }

  return fromBase64(base64);
};
