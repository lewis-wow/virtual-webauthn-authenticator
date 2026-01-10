import { HttpStatusCode } from '@repo/http';
import {
  PublicKeyCredentialRequestOptionsDtoSchema,
  AuthenticatorAgentGetAssertionResponseDtoSchema,
} from '@repo/virtual-authenticator/dto';
import { AuthenticatorAgentContextArgsSchema } from '@repo/virtual-authenticator/validation';
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
  context: AuthenticatorAgentContextArgsSchema,
});

// -------------------------------------
// Outputs
// -------------------------------------

export const GetCredentialResponseSchema = {
  [HttpStatusCode.OK_200]: AuthenticatorAgentGetAssertionResponseDtoSchema,
} as const;
