import { Schema } from 'effect';

import { KeyCurveAlgorithm } from '../../enums/KeyCurveAlgorithm';

export const KeyCurveAlgorithmSchema = Schema.Enums(
  KeyCurveAlgorithm,
).annotations({
  description: 'Key Curve Algorithm',
  examples: [KeyCurveAlgorithm.ES256],
});
