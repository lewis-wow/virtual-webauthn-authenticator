import { UUIDMapper } from '@repo/core/mappers';
import type { Uint8Array_ } from '@repo/types';
import { randomUUID } from 'node:crypto';

export const generateRandomUUIDBytes = (): Uint8Array_ => {
  return UUIDMapper.UUIDtoBytes(randomUUID());
};
