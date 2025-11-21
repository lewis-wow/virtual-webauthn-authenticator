import { Schema } from 'effect';

import { COSEKeyCurve } from '../../enums/COSEKeyCurve';
import { KeyCurveName } from '../../enums/KeyCurveName';

export const COSEKeyCurveSchema = Schema.Enums(COSEKeyCurve).annotations({
  description: 'COSE Key Curve',
  examples: [COSEKeyCurve[KeyCurveName.P256]],
});
