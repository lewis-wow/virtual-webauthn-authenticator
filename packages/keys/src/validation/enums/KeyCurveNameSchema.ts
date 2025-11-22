import { Schema } from 'effect';

import { KeyCurveName } from '../../enums/KeyCurveName';

export const KeyCurveNameSchema = Schema.Enums(KeyCurveName).annotations({
  description: 'Key Curve Name',
  examples: [KeyCurveName.P256],
});
