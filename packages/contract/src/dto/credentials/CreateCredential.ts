import z from 'zod';

import { PublicKeyCredentialCreationOptionsDtoSchema } from './components/PublicKeyCredentialCreationOptionsDtoSchema';
import { PublicKeyCredentialDtoSchema } from './components/PublicKeyCredentialDtoSchema';

// =============================================================================
// OPERATION: CREATE
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const CreateCredentialBodySchema = z.object({
  publicKeyCredentialCreationOptions:
    PublicKeyCredentialCreationOptionsDtoSchema.omit({
      /**
       * User is infered from token.
       */
      user: true,
    }),
  meta: z.object({
    origin: z.url(),
  }),
});

// -------------------------------------
// Outputs
// -------------------------------------

export const CreateCredentialResponseSchema = PublicKeyCredentialDtoSchema;
