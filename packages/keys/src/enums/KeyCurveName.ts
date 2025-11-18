import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

export const KeyCurveName = {
  P256: 'P-256',
  P384: 'P-384',
  P521: 'P-521',
  Ed25519: 'Ed25519',
} as const;

export type KeyCurveName = ValueOfEnum<typeof KeyCurveName>;

export const KeyCurveNameSchema = z.enum(KeyCurveName).meta({
  description: 'Key Curve Name',
  examples: [KeyCurveName.P256],
});

export type KeyCurveNameLoose = string;
export const KeyCurveNameLooseSchema = z.string();
