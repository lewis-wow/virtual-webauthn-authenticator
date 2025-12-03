import { ApiKeySchema } from '@repo/auth/validation';
import { Schema } from 'effect';

export const CreateApiKeyResponseSchema = Schema.Struct({
  apiKey: ApiKeySchema,
  plaintextKey: Schema.String,
});
