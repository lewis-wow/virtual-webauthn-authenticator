import { COSEKeyCurveParam } from '../../___enums/COSEKeyCurveParam';

import { Schema } from 'effect';

export const COSEKeyCurveParamSchema = Schema.Enums(
  COSEKeyCurveParam,
).annotations({
  description: 'COSE key curve param',
  examples: [COSEKeyCurveParam.crv],
});
