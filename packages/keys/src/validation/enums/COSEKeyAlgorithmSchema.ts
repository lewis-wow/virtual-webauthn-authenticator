import { COSEKeyAlgorithm } from '../../___enums/COSEKeyAlgorithm';
import { KeyAlgorithm } from '../../___enums/KeyAlgorithm';

import { Schema } from 'effect';

export const COSEKeyAlgorithmSchema = Schema.Enums(
  COSEKeyAlgorithm,
).annotations({
  description: 'COSE Key Algorithm',
  examples: [COSEKeyAlgorithm[KeyAlgorithm.ES256]],
});
