import { ApiKeySchema } from '@repo/api-key/validation';

import { ApiKeyDtoSchema } from './components/ApiKeyDtoSchema';

export const DELETE_API_KEY_FIELDS = {
  id: true,
} as const;

export const DeleteApiKeyFormSchema = ApiKeySchema.pick(DELETE_API_KEY_FIELDS);

export const DeleteApiKeyParamsSchema = ApiKeyDtoSchema.pick(
  DELETE_API_KEY_FIELDS,
);

export const DeleteApiKeyResponseSchema = ApiKeyDtoSchema;
