import {
  PublicKeyCredentialRequestOptionsSchema,
  PublicKeyCredentialSchema,
} from '../../models';

export const GetCredentialRequestBodySchema =
  PublicKeyCredentialRequestOptionsSchema;

export const GetCredentialResponseSchema = PublicKeyCredentialSchema;
