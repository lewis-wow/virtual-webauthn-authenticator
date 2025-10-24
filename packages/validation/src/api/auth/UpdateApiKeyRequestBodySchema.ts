import { CreateApiKeyRequestBodySchema } from './CreateApiKeyRequestBodySchema';

export const UpdateApiKeyRequestBodySchema = CreateApiKeyRequestBodySchema.meta(
  {
    ref: 'UpdateApiKeyRequestBody',
  },
);
