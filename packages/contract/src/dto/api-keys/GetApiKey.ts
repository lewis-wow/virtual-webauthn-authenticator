import { ApiKeyDtoSchema } from './components/ApiKeyDtoSchema';

// =============================================================================
// OPERATION: GET
// =============================================================================

export const GET_API_KEY_FIELDS = {
  id: true,
} as const;

// -------------------------------------
// Inputs
// -------------------------------------

export const GetApiKeyFormSchema = ApiKeyDtoSchema.pick(GET_API_KEY_FIELDS);

export const GetApiKeyParamsSchema = ApiKeyDtoSchema.pick(GET_API_KEY_FIELDS);

// -------------------------------------
// Outputs
// -------------------------------------

export const GetApiKeyResponseSchema = ApiKeyDtoSchema;
