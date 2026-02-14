import { HttpStatusCode } from '@repo/http';
import {
  PublicKeyCredentialRequestOptionsDtoSchema,
  AuthenticatorAgentGetAssertionResponseDtoSchema,
} from '@repo/virtual-authenticator/dto';
import { AuthenticationStateSchema } from '@repo/virtual-authenticator/state';
import { AuthenticatorAgentMetaArgsSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

// =============================================================================
// OPERATION: GET
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const GetCredentialBodySchema = z.object({
  publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsDtoSchema,
  meta: AuthenticatorAgentMetaArgsSchema.pick({
    origin: true,
  }),
  nextState: AuthenticationStateSchema,
  prevStateToken: z.string().optional(),
});

// -------------------------------------
// Outputs
// -------------------------------------

export const GetCredentialResponseSchema = {
  [HttpStatusCode.OK_200]: AuthenticatorAgentGetAssertionResponseDtoSchema,
} as const;
