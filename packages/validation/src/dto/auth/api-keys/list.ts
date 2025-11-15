import z from 'zod';

import { ApiKeyDtoSchema } from '../../../_dto/auth/ApiKeyDtoSchema';

export const ListApiKeysResponseSchema = z.array(ApiKeyDtoSchema);
