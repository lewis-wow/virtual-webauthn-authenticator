import z from 'zod';

import { ApiKeySchema } from '../../../models/auth/ApiKeySchema';

export const ListApiKeysResponseSchema = z.array(ApiKeySchema);
