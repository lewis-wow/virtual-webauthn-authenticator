import { ApiKeyDtoSchema } from '../../ApiKeyDtoSchema';

export const DeleteApiKeyRequestParamSchema = ApiKeyDtoSchema.pick({
  id: true,
}).meta({
  ref: 'DeleteApiKeyRequestParam',
});
