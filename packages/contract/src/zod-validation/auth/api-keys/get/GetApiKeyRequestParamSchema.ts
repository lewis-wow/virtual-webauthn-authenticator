import { ApiKeyDtoSchema } from '../../ApiKeyDtoSchema';

export const GetApiKeyRequestParamSchema = ApiKeyDtoSchema.pick({
  id: true,
}).meta({
  ref: 'GetApiKeyRequestParam',
});
