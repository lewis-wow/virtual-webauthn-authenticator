import type { Uint8Array_ } from '@repo/types';

import { isUuid } from './isUuid';
import { uuidToBytes } from './uuidToBytes';

export const tryUuidToBytes = (uuid: string): Uint8Array_ | null => {
  if (!isUuid(uuid)) {
    return null;
  }

  return uuidToBytes(uuid);
};
