import z from 'zod';

import { COSEKeyType } from '../../enums/COSEKeyType';

export const COSEKeyTypeSchema = z.enum(COSEKeyType);
