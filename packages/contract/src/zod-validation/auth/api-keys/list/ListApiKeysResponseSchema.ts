import z from 'zod';

import { ApiKeyDtoSchema } from '../../ApiKeyDtoSchema';

export const ListApiKeysResponseSchema = z.array(ApiKeyDtoSchema);
