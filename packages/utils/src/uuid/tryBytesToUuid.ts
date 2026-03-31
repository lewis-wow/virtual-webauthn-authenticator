import type { Uint8Array_ } from '@repo/types';

import { bytesToUuid } from './bytesToUuid';

export const tryBytesToUuid = (bytes: Uint8Array_): string | null => {
  if (bytes.length !== 16) {
    return null;
  }

  return bytesToUuid(bytes);
};
