import z from 'zod';

import { COSEKeyType } from '../../enums/COSEKeyType';
import { KeyType } from '../../enums/KeyType';

export const COSEKeyTypeSchema = z.enum(COSEKeyType).meta({
  description: 'COSE Key Type',
  examples: [COSEKeyType[KeyType.EC]],
});
