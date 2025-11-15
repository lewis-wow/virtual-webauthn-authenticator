import { z } from 'zod';

import { ApiKeyJwtPayloadDtoSchema } from './ApiKeyJwtPayloadDtoSchema';
import { PersonalJwtPayloadDtoSchema } from './PersonalJwtPayloadDtoSchema';

export const JwtPayloadDtoSchema = z.discriminatedUnion('tokenType', [
  ApiKeyJwtPayloadDtoSchema,
  PersonalJwtPayloadDtoSchema,
]);
