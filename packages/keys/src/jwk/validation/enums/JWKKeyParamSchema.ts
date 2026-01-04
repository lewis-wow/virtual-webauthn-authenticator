import z from 'zod';

import { JWKKeyParam } from '../../enums/JWKKeyParam';

export const JWKKeyParamSchema = z.enum(JWKKeyParam);
