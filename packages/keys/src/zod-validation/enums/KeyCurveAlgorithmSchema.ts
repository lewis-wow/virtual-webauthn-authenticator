import z from 'zod';

import { KeyCurveAlgorithm } from '../../enums/KeyCurveAlgorithm';

export const KeyCurveAlgorithmSchema = z.enum(
  KeyCurveAlgorithm,
).meta({
  description: 'Key Curve Algorithm',
  examples: [KeyCurveAlgorithm.ES256],
});
