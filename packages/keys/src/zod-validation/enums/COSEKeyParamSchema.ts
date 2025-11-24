import z from 'zod';

import { COSEKeyParam } from '../../enums/COSEKeyParam';

export const COSEKeyParamSchema = z.enum(COSEKeyParam).meta({
  description: 'COSE key param',
  examples: [COSEKeyParam.kty],
});
