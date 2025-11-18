import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

export const SupportedKeyCurveName = {
  P256: 'P-256',
  P384: 'P-384',
  P521: 'P-521',
  Ed25519: 'Ed25519',
} as const;

export type SupportedKeyCurveName = ValueOfEnum<typeof SupportedKeyCurveName>;

export const SupportedKeyCurveNameSchema = z.enum(SupportedKeyCurveName).meta({
  description: 'Supported Key Curve Name',
  examples: [SupportedKeyCurveName.P256],
});
