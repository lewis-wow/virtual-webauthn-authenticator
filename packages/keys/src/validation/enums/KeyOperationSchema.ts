import { Schema } from 'effect';

import { KeyOperation } from '../../enums/KeyOperation';

export const KeyOperationSchema = Schema.Enums(
  KeyOperation,
).annotations({
  description: 'Key operation',
  examples: [KeyOperation.ENCRYPT],
});
