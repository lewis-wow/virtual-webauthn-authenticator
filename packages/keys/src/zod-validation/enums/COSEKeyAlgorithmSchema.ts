import z from 'zod';

import { COSEKeyAlgorithm } from '../../enums/COSEKeyAlgorithm';
import { KeyAlgorithm } from '../../enums/KeyAlgorithm';

export const COSEKeyAlgorithmSchema = z.enum(COSEKeyAlgorithm).meta({
  description: 'COSE Key Algorithm',
  examples: [COSEKeyAlgorithm[KeyAlgorithm.ES256]],
});
