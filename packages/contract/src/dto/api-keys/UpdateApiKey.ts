import { omit, pick } from 'lodash-es';

import { ApiKeyDtoSchema } from './components/ApiKeyDtoSchema';

// =============================================================================
// OPERATION: UPDATE
// =============================================================================

export const UPDATE_API_KEY_FIELDS = {
  id: true,
  name: true,
  permissions: true,
  metadata: true,
  expiresAt: true,
  revokedAt: true,
  enabled: true,
} as const;

// -------------------------------------
// Inputs
// -------------------------------------

export const UpdateApiKeyFormSchema = ApiKeyDtoSchema.pick(
  UPDATE_API_KEY_FIELDS,
).partial();

export const UpdateApiKeyBodySchema = ApiKeyDtoSchema.pick(
  omit(UPDATE_API_KEY_FIELDS, 'id'),
).partial();

export const UpdateApiKeyParamsSchema = ApiKeyDtoSchema.pick(
  pick(UPDATE_API_KEY_FIELDS, 'id'),
);

// -------------------------------------
// Outputs
// -------------------------------------

export const UpdateApiKeyResponseSchema = ApiKeyDtoSchema;
