import z from 'zod';

import { COSEKeyParam } from '../../enums/COSEKeyParam';

export const COSEKeyParamSchema = z.enum(COSEKeyParam);
