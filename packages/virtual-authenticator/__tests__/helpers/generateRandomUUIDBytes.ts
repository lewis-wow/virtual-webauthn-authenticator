import { UUIDMapper } from '@repo/core/mappers';
import { randomUUID } from 'node:crypto';

export const generateRandomUUIDBytes = (): Uint8Array => {
  return UUIDMapper.UUIDtoBytes(randomUUID());
};
