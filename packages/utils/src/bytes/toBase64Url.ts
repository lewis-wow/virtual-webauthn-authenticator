import type { Uint8Array_ } from '@repo/types';

import { toBase64 } from './toBase64';

export const toBase64Url = (input: Uint8Array_) => {
  return toBase64(input)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};
