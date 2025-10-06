import { createHash } from 'node:crypto';

export const sha256 = (data: Buffer): Buffer => {
  return createHash('sha256').update(data).digest();
};
