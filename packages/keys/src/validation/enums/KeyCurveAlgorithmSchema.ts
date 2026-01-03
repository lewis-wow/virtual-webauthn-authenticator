import { KeyCurveAlgorithm } from '../../___enums/KeyCurveAlgorithm';

import { Schema } from 'effect';

export const KeyCurveAlgorithmSchema = Schema.Enums(
  KeyCurveAlgorithm,
).annotations({
  description: 'Key Curve Algorithm',
  examples: [KeyCurveAlgorithm.ES256],
});
