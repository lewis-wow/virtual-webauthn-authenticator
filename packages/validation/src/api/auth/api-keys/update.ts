import { ApikeySchema } from '../../../models/auth/ApiKeySchema';
import { CreateApiKeyRequestBodySchema } from './create';
import { GetApiKeyRequestParamSchema } from './get';

export const UpdateApiKeyRequestParamSchema = GetApiKeyRequestParamSchema.meta({
  ref: 'UpdateApiKeyRequestParam',
});

export const UpdateApiKeyRequestBodySchema = CreateApiKeyRequestBodySchema.meta(
  {
    ref: 'UpdateApiKeyRequestBody',
  },
);

export const UpdateApiKeyResponseSchema = ApikeySchema.omit({ keyHash: true });
