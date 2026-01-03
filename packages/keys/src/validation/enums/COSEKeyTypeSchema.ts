import { COSEKeyType } from '../../___enums/COSEKeyType';
import { KeyType } from '../../___enums/KeyType';

import { Schema } from 'effect';

export const COSEKeyTypeSchema = Schema.Enums(COSEKeyType).annotations({
  description: 'COSE Key Type',
  examples: [COSEKeyType[KeyType.EC]],
});
