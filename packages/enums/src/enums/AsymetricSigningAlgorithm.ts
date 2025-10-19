import z from 'zod';

import type { ValueOfEnum } from '../types.js';

export const AsymetricSigningAlgorithm = {
  ES256: 'ES256',
  ES384: 'ES384',
  ES512: 'ES512',

  EdDSA: 'EdDSA',

  PS256: 'PS256',
  PS384: 'PS384',
  PS512: 'PS512',

  RS256: 'RS256',
  RS384: 'RS384',
  RS512: 'RS512',

  RS1: 'RS1',
} as const;

export type AsymetricSigningAlgorithm = ValueOfEnum<
  typeof AsymetricSigningAlgorithm
>;

export const AsymetricSigningAlgorithmSchema = z
  .enum(AsymetricSigningAlgorithm)
  .meta({
    description: 'Asymetric signing algorithm',
    examples: [AsymetricSigningAlgorithm.ES256],
  });
