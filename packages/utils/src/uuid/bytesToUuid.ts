import type { Uint8Array_ } from '@repo/types';

import { toHex } from '../bytes/toHex';

export const bytesToUuid = (bytes: Uint8Array_): string => {
  const hex = toHex(bytes);

  // Insert hyphens at the correct positions (8-4-4-4-12)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
