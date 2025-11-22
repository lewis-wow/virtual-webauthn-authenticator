import { Schema } from 'effect';

import { COSEKeyRsaParam } from '../../enums/COSEKeyRsaParam';

export const COSEKeyRsaParamSchema = Schema.Enums(COSEKeyRsaParam).annotations({
  description: 'COSE RSA param',
  examples: [COSEKeyRsaParam.n],
});
