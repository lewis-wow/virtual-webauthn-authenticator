import z from 'zod';

import { QueryCodecSchema } from '../../codecs/QueryCodecSchema';
import { PublicKeyCredentialRequestOptionsSchema } from '../../models/credentials/PublicKeyCredentialRequestOptionsSchema';
import { PublicKeyCredentialSchema } from '../../models/credentials/PublicKeyCredentialSchema';

export const GetCredentialRequestQuerySchema = QueryCodecSchema(
  PublicKeyCredentialRequestOptionsSchema.extend({
    rpId: z.string(),
  }),
);

export const GetCredentialResponseSchema = PublicKeyCredentialSchema;
