import z from 'zod';

import { JWKKeyCurveName } from '../../enums/JWKKeyCurveName';

export const JWKKeyCurveNameSchema = z.enum(JWKKeyCurveName);
