import { HttpStatusCode } from '@repo/http';
import { AuthenticatorAgentCreateCredentialResponseDtoSchema } from '@repo/virtual-authenticator-agent/dto';
import { AuthenticatorAgentMetaArgsSchema } from '@repo/virtual-authenticator-agent/validation';
import {
  PublicKeyCredentialCreationOptionsDtoSchema,
  PublicKeyCredentialUserEntityDtoSchema,
} from '@repo/virtual-authenticator/dto';
import { RegistrationStateSchema } from '@repo/virtual-authenticator/state';
import z from 'zod';

// =============================================================================
// OPERATION: CREATE
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const CreateCredentialBodySchema = z.object({
  publicKeyCredentialCreationOptions:
    PublicKeyCredentialCreationOptionsDtoSchema.extend({
      /**
       * User is infered from token.
       */
      user: PublicKeyCredentialUserEntityDtoSchema.extend({
        displayName: z.string().optional(),
      })
        .omit({
          id: true,
          name: true,
        })
        .optional(),
    }),
  meta: AuthenticatorAgentMetaArgsSchema.pick({
    origin: true,
  }),
  nextState: RegistrationStateSchema.optional(),
  prevStateToken: z.string().optional(),
});

// -------------------------------------
// Outputs
// -------------------------------------

export const CreateCredentialResponseSchema = {
  [HttpStatusCode.OK_200]: AuthenticatorAgentCreateCredentialResponseDtoSchema,
};
