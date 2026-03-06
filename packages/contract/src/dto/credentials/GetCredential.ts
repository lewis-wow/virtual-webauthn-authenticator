import { HttpStatusCode } from '@repo/http';
import { AuthenticatorAgentGetAssertionResponseDtoSchema } from '@repo/virtual-authenticator-agent/dto';
import { AuthenticatorAgentMetaArgsSchema } from '@repo/virtual-authenticator-agent/validation';
import { PublicKeyCredentialRequestOptionsDtoSchema } from '@repo/virtual-authenticator/dto';
import { AuthenticationStateSchema } from '@repo/virtual-authenticator/state';
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
  nextState: AuthenticationStateSchema.optional(),
  prevStateToken: z.string().optional(),
});

// -------------------------------------
// Outputs
// -------------------------------------

export const GetCredentialResponseSchema = {
  [HttpStatusCode.OK_200]: AuthenticatorAgentGetAssertionResponseDtoSchema,
} as const;
