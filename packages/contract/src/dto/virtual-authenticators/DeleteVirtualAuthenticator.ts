import { HttpStatusCode } from '@repo/http';

import { VirtualAuthenticatorDtoSchema } from './components/VirtualAuthenticatorDtoSchema';

// =============================================================================
// OPERATION: DELETE
// =============================================================================

export const DELETE_VIRTUAL_AUTHENTICATOR_FIELDS = {
  id: true,
} as const;

// -------------------------------------
// Inputs
// -------------------------------------

export const DeleteVirtualAuthenticatorParamsSchema =
  VirtualAuthenticatorDtoSchema.pick(DELETE_VIRTUAL_AUTHENTICATOR_FIELDS);

// -------------------------------------
// Outputs
// -------------------------------------

export const DeleteVirtualAuthenticatorResponseSchema = {
  [HttpStatusCode.OK_200]: VirtualAuthenticatorDtoSchema,
};
