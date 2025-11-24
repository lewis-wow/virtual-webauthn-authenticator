import z from 'zod';

import { KeyOperation } from '../../enums/KeyOperation';

export const KeyOperationSchema = z.enum(KeyOperation).meta({
  description: 'Key operation',
  examples: [KeyOperation.ENCRYPT],
});
