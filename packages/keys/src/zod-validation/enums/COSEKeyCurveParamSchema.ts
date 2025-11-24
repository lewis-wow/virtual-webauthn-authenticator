import z from 'zod';

import { COSEKeyCurveParam } from '../../enums/COSEKeyCurveParam';

export const COSEKeyCurveParamSchema = z.enum(COSEKeyCurveParam).meta({
  description: 'COSE key curve param',
  examples: [COSEKeyCurveParam.crv],
});
