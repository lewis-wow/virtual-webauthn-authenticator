import z from 'zod';

import { PublicKeyCredentialRequestOptionsSchema } from '../../models/credentials/PublicKeyCredentialRequestOptionsSchema';
import { PublicKeyCredentialSchema } from '../../models/credentials/PublicKeyCredentialSchema';
import { QuerySchema } from '../../transformers/QuerySchema';

export const GetCredentialRequestQuerySchema = QuerySchema(
  PublicKeyCredentialRequestOptionsSchema.extend({
    rpId: z.string(),
  }),
);

export const GetCredentialResponseSchema = PublicKeyCredentialSchema;
