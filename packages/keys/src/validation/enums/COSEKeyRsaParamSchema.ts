import { COSEKeyRsaParam } from '../../___enums/COSEKeyRsaParam';

import { Schema } from 'effect';

export const COSEKeyRsaParamSchema = Schema.Enums(COSEKeyRsaParam).annotations({
  description: 'COSE RSA param',
  examples: [COSEKeyRsaParam.n],
});
