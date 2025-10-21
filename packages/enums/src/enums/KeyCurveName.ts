import z from 'zod';

import type { ValueOfEnum } from '../types.js';

export const KeyCurveName = {
  P256: 'P-256',
  P384: 'P-384',
  P521: 'P-521',
  Ed25519: 'Ed25519',
} as const;

export type KeyCurveName = ValueOfEnum<typeof KeyCurveName>;

export const KeyCurveNameSchema = z.enum(KeyCurveName).meta({
  description: 'Key curve name',
  examples: [KeyCurveName.P256],
});
