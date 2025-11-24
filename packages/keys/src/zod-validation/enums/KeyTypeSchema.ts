import z from 'zod';

import { KeyType } from '../../enums/KeyType';

export const KeyTypeSchema = z.enum(KeyType).meta({
  description: 'Key type',
  examples: [KeyType.EC],
});
