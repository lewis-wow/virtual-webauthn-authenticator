import z from 'zod';

import { KeyAlgorithm } from '../../enums/KeyAlgorithm';

export const KeyAlgorithmSchema = z.enum(KeyAlgorithm).meta({
  description: 'Key Algorithm',
  examples: [KeyAlgorithm.ES256],
});
