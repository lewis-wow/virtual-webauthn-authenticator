import z from 'zod';

import { COSEKeyRsaParam } from '../../enums/COSEKeyRsaParam';

export const COSEKeyRsaParamSchema = z.enum(COSEKeyRsaParam).meta({
  description: 'COSE RSA param',
  examples: [COSEKeyRsaParam.n],
});
