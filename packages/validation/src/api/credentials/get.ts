import {
  PublicKeyCredentialRequestOptionsSchema,
  PublicKeyCredentialSchema,
} from '../../models';

export const GetCredentialRequestQuerySchema =
  PublicKeyCredentialRequestOptionsSchema;

export const GetCredentialResponseSchema = PublicKeyCredentialSchema;
