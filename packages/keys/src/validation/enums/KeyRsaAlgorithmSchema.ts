import { Schema } from 'effect';

import { KeyRsaAlgorithm } from '../../enums/KeyRsaAlgorithm';

export const KeyRsaAlgorithmSchema = Schema.Enums(
  KeyRsaAlgorithm,
).annotations({
  description: 'Key RSA Algorithm',
  examples: [KeyRsaAlgorithm.PS256],
});
