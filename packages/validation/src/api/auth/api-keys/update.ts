import { ApikeySchema } from '../../../models';
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

export const UpdateApiKeyResponseSchema = ApikeySchema.omit({ key: true });
