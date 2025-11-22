import { Schema } from 'effect';

import { KeyAlgorithm } from '../../enums/KeyAlgorithm';

export const KeyAlgorithmSchema = Schema.Enums(KeyAlgorithm).annotations({
  description: 'Key Algorithm',
  examples: [KeyAlgorithm.ES256],
});
