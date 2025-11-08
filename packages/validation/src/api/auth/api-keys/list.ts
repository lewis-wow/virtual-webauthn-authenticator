import z from 'zod';

import { ApiKeySchemaCodec } from '../../../models/auth/ApiKeySchema';

export const ListApiKeysResponseSchema = z.array(ApiKeySchemaCodec);
