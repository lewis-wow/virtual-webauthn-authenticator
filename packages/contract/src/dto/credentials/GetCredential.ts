import { PublicKeyCredentialCandidateDtoSchema } from '@repo/virtual-authenticator/dto';
import z from 'zod';

import { PublicKeyCredentialDtoSchema } from './components/PublicKeyCredentialDtoSchema';
import { PublicKeyCredentialRequestOptionsDtoSchema } from './components/PublicKeyCredentialRequestOptionsDtoSchema';

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

export const GetCredentialResponseSchema = PublicKeyCredentialDtoSchema.or(
  z.array(PublicKeyCredentialCandidateDtoSchema),
);
