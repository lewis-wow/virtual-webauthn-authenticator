import { ApiKeySchema } from '@repo/api-key/validation';
import { DurationSchema } from '@repo/validation';
import z from 'zod';

import { ApiKeyDtoSchema } from './components/ApiKeyDtoSchema';

export const CREATE_API_KEY_FIELDS = {
  name: true,
  permissions: true,
  expiresAt: true,
  enabled: true,
} as const;

export const CreateApiKeyFormSchema = ApiKeySchema.extend({
  expiresAt: DurationSchema.nullable(),
}).pick(CREATE_API_KEY_FIELDS);

export const CreateApiKeyBodySchema = ApiKeyDtoSchema.extend({
  expiresAt: DurationSchema.nullable(),
}).pick(CREATE_API_KEY_FIELDS);

export const CreateApiKeyResponseSchema = z.object({
  apiKey: ApiKeyDtoSchema,
  plaintextKey: z.string(),
});
