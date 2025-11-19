import { Schema } from 'effect';

import { COSEKeyAlgorithm } from '../../enums/COSEKeyAlgorithm';
import { KeyAlgorithm } from '../../enums/KeyAlgorithm';

export const COSEKeyAlgorithmSchema = Schema.Enums(
  COSEKeyAlgorithm,
).annotations({
  description: 'COSE Key Algorithm',
  examples: [COSEKeyAlgorithm[KeyAlgorithm.ES256]],
});
