import { ApiKeyDtoSchema } from './components/ApiKeyDtoSchema';

export const GET_API_KEY_FIELDS = {
  id: true,
} as const;

export const GetApiKeyFormSchema = ApiKeyDtoSchema.pick(GET_API_KEY_FIELDS);

export const GetApiKeyParamsSchema = ApiKeyDtoSchema.pick(GET_API_KEY_FIELDS);

export const GetApiKeyResponseSchema = ApiKeyDtoSchema;
