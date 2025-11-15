import z from 'zod';

import { PublicKeyCredentialRequestOptionsSchema } from '../../models/credentials/PublicKeyCredentialRequestOptionsSchema';
import { PublicKeyCredentialSchema } from '../../models/credentials/PublicKeyCredentialSchema';

export const GetCredentialRequestQuerySchema =
  PublicKeyCredentialRequestOptionsSchema.extend({
    rpId: z.string(),
  });

export const GetCredentialResponseSchema = PublicKeyCredentialSchema;
