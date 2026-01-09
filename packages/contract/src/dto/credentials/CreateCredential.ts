import { HttpStatusCode } from '@repo/http';
import {
  PublicKeyCredentialCreationOptionsDtoSchema,
  PublicKeyCredentialUserEntityDtoSchema,
  AuthenticatorAgentCreateCredentialResponseDtoSchema,
} from '@repo/virtual-authenticator/dto';
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
  meta: z.object({
    origin: z.url(),
  }),
});

// -------------------------------------
// Outputs
// -------------------------------------

export const CreateCredentialResponseSchema = {
  [HttpStatusCode.OK]: AuthenticatorAgentCreateCredentialResponseDtoSchema,
};
