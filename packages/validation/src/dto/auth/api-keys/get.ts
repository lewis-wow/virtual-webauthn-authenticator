import { ApiKeyDtoSchema } from '../../../_dto/auth/ApiKeyDtoSchema';
import { ApiKeySchema } from '../../../models/auth/ApiKeySchema';

export const GetApiKeyRequestParamSchema = ApiKeyDtoSchema.pick({
  id: true,
}).meta({
  ref: 'GetApiKeyRequestParam',
});

export const GetApiKeyResponseSchema = ApiKeySchema;
