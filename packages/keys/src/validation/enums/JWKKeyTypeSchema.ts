import z from 'zod';

import { JWKKeyType } from '../../enums/JWKKeyType';

export const JWKKeyTypeSchema = z.enum(JWKKeyType);
