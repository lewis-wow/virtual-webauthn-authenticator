import { ApiKeyDtoSchema } from '../../ApiKeyDtoSchema';

export const UpdateApiKeyRequestParamSchema = ApiKeyDtoSchema.pick({
  id: true,
}).meta({
  ref: 'UpdateApiKeyRequestParam',
});
