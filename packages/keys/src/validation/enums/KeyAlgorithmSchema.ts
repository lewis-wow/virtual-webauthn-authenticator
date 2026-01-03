import { KeyAlgorithm } from '../../___enums/KeyAlgorithm';

import { Schema } from 'effect';

export const KeyAlgorithmSchema = Schema.Enums(KeyAlgorithm).annotations({
  description: 'Key Algorithm',
  examples: [KeyAlgorithm.ES256],
});
