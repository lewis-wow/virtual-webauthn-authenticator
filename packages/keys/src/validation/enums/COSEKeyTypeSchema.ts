import { Schema } from 'effect';

import { COSEKeyType } from '../../enums/COSEKeyType';
import { KeyType } from '../../enums/KeyType';

export const COSEKeyTypeSchema = Schema.Enums(
  COSEKeyType,
).annotations({
  description: 'COSE Key Type',
  examples: [COSEKeyType[KeyType.EC]],
});
