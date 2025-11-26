import { Schema } from 'effect';

import { COSEKeyCurveParam } from '../../enums/COSEKeyCurveParam';

export const COSEKeyCurveParamSchema = Schema.Enums(
  COSEKeyCurveParam,
).annotations({
  description: 'COSE key curve param',
  examples: [COSEKeyCurveParam.crv],
});
