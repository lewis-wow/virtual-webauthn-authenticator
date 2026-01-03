import { KeyRsaAlgorithm } from '../../___enums/KeyRsaAlgorithm';

import { Schema } from 'effect';

export const KeyRsaAlgorithmSchema = Schema.Enums(KeyRsaAlgorithm).annotations({
  description: 'Key RSA Algorithm',
  examples: [KeyRsaAlgorithm.PS256],
});
