import z from 'zod';

import { COSEKeyTypeParam } from '../../enums/COSEKeyTypeParam';

export const COSEKeyTypeParamSchema = z.enum(COSEKeyTypeParam);
