import { PublicKeyCredentialRequestOptionsSchema } from '../../models/credentials/PublicKeyCredentialRequestOptionsSchema';
import { PublicKeyCredentialSchema } from '../../models/credentials/PublicKeyCredentialSchema';

export const GetCredentialRequestQuerySchema =
  PublicKeyCredentialRequestOptionsSchema;

export const GetCredentialResponseSchema = PublicKeyCredentialSchema;
