import { HttpStatusCode } from '@repo/http';

import { VirtualAuthenticatorDtoSchema } from './components/VirtualAuthenticatorDtoSchema';

// =============================================================================
// OPERATION: UPDATE
// =============================================================================

export const UPDATE_VIRTUAL_AUTHENTICATOR_FIELDS = {
  id: true,
  isActive: true,
} as const;

// -------------------------------------
// Inputs
// -------------------------------------

export const UpdateVirtualAuthenticatorParamsSchema =
  VirtualAuthenticatorDtoSchema.pick({ id: true });

export const UpdateVirtualAuthenticatorBodySchema =
  VirtualAuthenticatorDtoSchema.pick({ isActive: true }).partial();

// -------------------------------------
// Outputs
// -------------------------------------

export const UpdateVirtualAuthenticatorResponseSchema = {
  [HttpStatusCode.OK_200]: VirtualAuthenticatorDtoSchema,
};
