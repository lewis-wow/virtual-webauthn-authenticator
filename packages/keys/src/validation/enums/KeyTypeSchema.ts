import { KeyType } from '../../___enums/KeyType';

import { Schema } from 'effect';

export const KeyTypeSchema = Schema.Enums(KeyType).annotations({
  description: 'Key type',
  examples: [KeyType.EC],
});
