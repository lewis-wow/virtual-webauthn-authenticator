import type { BinaryLike } from 'node:crypto';
import { toBuffer } from './toBuffer.js';

export const toBase64Url = (data: BufferSource | BinaryLike) =>
  toBuffer(data).toString('base64url');
