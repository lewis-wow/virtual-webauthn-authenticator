import z from 'zod';

import { COSEKeyAlgorithm } from '../../enums/COSEKeyAlgorithm';

export const COSEKeyAlgorithmSchema = z.enum(COSEKeyAlgorithm);
