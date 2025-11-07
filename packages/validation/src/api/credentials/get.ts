import { PublicKeyCredentialRequestOptionsSchema } from '../../models/credentials/PublicKeyCredentialRequestOptionsSchema';
import { PublicKeyCredentialSchema } from '../../models/credentials/PublicKeyCredentialSchema';
import { QuerySchema } from '../../transformers/QuerySchema';

export const GetCredentialRequestQuerySchema = QuerySchema(
  PublicKeyCredentialRequestOptionsSchema,
);

export const GetCredentialResponseSchema = PublicKeyCredentialSchema;
