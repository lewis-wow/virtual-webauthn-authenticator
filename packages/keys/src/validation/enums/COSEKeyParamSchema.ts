import { COSEKeyParam } from '../../___enums/COSEKeyParam';

import { Schema } from 'effect';

export const COSEKeyParamSchema = Schema.Enums(COSEKeyParam).annotations({
  description: 'COSE key param',
  examples: [COSEKeyParam.kty],
});
