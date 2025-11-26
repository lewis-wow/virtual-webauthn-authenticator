import z from 'zod';

import { KeyCurveName } from '../../enums/KeyCurveName';

export const KeyCurveNameSchema = z.enum(KeyCurveName).meta({
  description: 'Key Curve Name',
  examples: [KeyCurveName.P256],
});
