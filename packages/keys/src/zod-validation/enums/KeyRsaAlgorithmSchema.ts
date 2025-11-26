import z from 'zod';

import { KeyRsaAlgorithm } from '../../enums/KeyRsaAlgorithm';

export const KeyRsaAlgorithmSchema = z.enum(KeyRsaAlgorithm).meta({
  description: 'Key RSA Algorithm',
  examples: [KeyRsaAlgorithm.PS256],
});
