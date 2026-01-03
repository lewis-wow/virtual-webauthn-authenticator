import { KeyCurveName } from '../../___enums/KeyCurveName';

import { Schema } from 'effect';

export const KeyCurveNameSchema = Schema.Enums(KeyCurveName).annotations({
  description: 'Key Curve Name',
  examples: [KeyCurveName.P256],
});
