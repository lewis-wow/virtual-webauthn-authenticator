import { ApiKeySchema } from '@repo/auth/zod-validation';

import { ApiKeyDtoSchema } from './components/ApiKeyDtoSchema';

// =============================================================================
// OPERATION: DELETE
// =============================================================================

export const DELETE_API_KEY_FIELDS = {
  id: true,
} as const;

// -------------------------------------
// Inputs
// -------------------------------------

export const DeleteApiKeyFormSchema = ApiKeySchema.pick(DELETE_API_KEY_FIELDS);

export const DeleteApiKeyParamsSchema = ApiKeyDtoSchema.pick(
  DELETE_API_KEY_FIELDS,
);

// -------------------------------------
// Outputs
// -------------------------------------

export const DeleteApiKeyResponseSchema = ApiKeyDtoSchema;
