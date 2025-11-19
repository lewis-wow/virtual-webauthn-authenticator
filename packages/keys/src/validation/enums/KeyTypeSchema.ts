import { Schema } from 'effect';

import { KeyType } from '../../enums/KeyType';

export const KeyTypeSchema = Schema.Enums(
  KeyType,
).annotations({
  description: 'Key type',
  examples: [KeyType.EC],
});
