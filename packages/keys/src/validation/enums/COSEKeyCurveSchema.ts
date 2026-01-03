import { COSEKeyCurve } from '../../___enums/COSEKeyCurve';
import { KeyCurveName } from '../../___enums/KeyCurveName';

import { Schema } from 'effect';

export const COSEKeyCurveSchema = Schema.Enums(COSEKeyCurve).annotations({
  description: 'COSE Key Curve',
  examples: [COSEKeyCurve[KeyCurveName.P256]],
});
