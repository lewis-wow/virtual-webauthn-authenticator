import type { Uint8Array_ } from '@repo/types';
import { uuidToBytes } from '@repo/utils';
import { randomUUID } from 'node:crypto';

export const generateRandomUUIDBytes = (): Uint8Array_ => {
  return uuidToBytes(randomUUID());
};
