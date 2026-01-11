import z from 'zod';

import { COSEKeyCurveName } from '../../enums/COSEKeyCurveName';

export const COSEKeyCurveNameSchema = z.enum(COSEKeyCurveName);
