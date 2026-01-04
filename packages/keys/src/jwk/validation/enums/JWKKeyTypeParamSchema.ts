import z from 'zod';

import { JWKKeyTypeParam } from '../../enums/JWKKeyTypeParam';

export const JWKKeyTypeParamSchema = z.enum(JWKKeyTypeParam);
