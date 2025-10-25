import { DeleteResponseSchema } from '../../common';
import { GetApiKeyRequestParamSchema } from './get';

export const DeleteApiKeyRequestParamSchema = GetApiKeyRequestParamSchema.meta({
  ref: 'DeleteApiKeyRequestParam',
});

export const DeleteApiKeyResponseSchema = DeleteResponseSchema.meta({
  ref: 'DeleteApiKeyResponse',
});
