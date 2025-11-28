import { ApiKeySchema } from '@repo/auth/zod-validation';
import z from 'zod';

import { ApiKeyDtoSchema } from './components/ApiKeyDtoSchema';

// =============================================================================
// OPERATION: CREATE
// =============================================================================

export const CREATE_API_KEY_FIELDS = {
  name: true,
  permissions: true,
  metadata: true,
  expiresAt: true,
  enabled: true,
} as const;

// -------------------------------------
// Inputs
// -------------------------------------

export const CreateApiKeyFormSchema = ApiKeySchema.pick(CREATE_API_KEY_FIELDS);

export const CreateApiKeyBodySchema = ApiKeyDtoSchema.pick(
  CREATE_API_KEY_FIELDS,
);

// -------------------------------------
// Outputs
// -------------------------------------

export const CreateApiKeyResponseSchema = z.object({
  apiKey: ApiKeyDtoSchema,
  plaintextKey: z.string(),
});
