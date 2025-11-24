import z from 'zod';

import { COSEKeyCurve } from '../../enums/COSEKeyCurve';
import { KeyCurveName } from '../../enums/KeyCurveName';

export const COSEKeyCurveSchema = z.enum(COSEKeyCurve).meta({
  description: 'COSE Key Curve',
  examples: [COSEKeyCurve[KeyCurveName.P256]],
});
