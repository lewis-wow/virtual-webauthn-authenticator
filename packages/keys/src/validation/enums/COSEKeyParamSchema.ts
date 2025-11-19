import { Schema } from 'effect';

import { COSEKeyParam } from '../../enums/COSEKeyParam';

export const COSEKeyParamSchema = Schema.Enums(
  COSEKeyParam,
).annotations({
  description: 'COSE key param',
  examples: [COSEKeyParam.kty],
});
