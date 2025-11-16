import { createHash, type BinaryLike } from 'node:crypto';

export const sha256 = (data: BinaryLike): Buffer => {
  return createHash('sha256').update(data).digest();
};
