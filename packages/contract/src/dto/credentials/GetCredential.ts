import { HttpStatusCode } from '@repo/http';
import {
  PublicKeyCredentialRequestOptionsDtoSchema,
  AuthenticatorAgentGetAssertionResponseDtoSchema,
  VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadDtoSchema,
} from '@repo/virtual-authenticator/dto';
import z from 'zod';

// =============================================================================
// OPERATION: GET
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const GetCredentialBodySchema = z.object({
  publicKeyCredentialRequestOptions:
    PublicKeyCredentialRequestOptionsDtoSchema.extend({
      rpId: z.string(),
    }),
  meta: z.object({
    origin: z.url(),
  }),
});

// -------------------------------------
// Outputs
// -------------------------------------

export const GetCredentialResponseSchema = {
  [HttpStatusCode.OK]: AuthenticatorAgentGetAssertionResponseDtoSchema,
  [HttpStatusCode.PRECONDITION_REQUIRED]:
    VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadDtoSchema,
} as const;
