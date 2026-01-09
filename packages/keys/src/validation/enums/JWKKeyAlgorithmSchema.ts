import z from 'zod';

import { JWKKeyAlgorithm } from '../../enums/JWKKeyAlgorithm';

export const JWKKeyAlgorithmSchema = z.enum(JWKKeyAlgorithm);
