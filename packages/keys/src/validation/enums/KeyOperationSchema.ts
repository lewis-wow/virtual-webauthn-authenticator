import { KeyOperation } from '../../___enums/KeyOperation';

import { Schema } from 'effect';

export const KeyOperationSchema = Schema.Enums(KeyOperation).annotations({
  description: 'Key operation',
  examples: [KeyOperation.ENCRYPT],
});
