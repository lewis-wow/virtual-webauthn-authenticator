import z from 'zod';

import { PublicKeyCredentialCreationOptionsDtoSchema } from './components/PublicKeyCredentialCreationOptionsDtoSchema';
import { PublicKeyCredentialDtoSchema } from './components/PublicKeyCredentialDtoSchema';
import { PublicKeyCredentialUserEntityDtoSchema } from './components/PublicKeyCredentialUserEntityDtoSchema';

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

export const CreateCredentialResponseSchema = PublicKeyCredentialDtoSchema;
