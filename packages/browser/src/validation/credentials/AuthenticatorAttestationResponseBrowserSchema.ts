import { BytesArrayBufferBrowserSchemaCodec } from '../../../../validation/src/browser/BytesArrayBufferBrowserSchemaCodec';
import { AuthenticatorAttestationResponseSchema } from '../../models/credentials/AuthenticatorAttestationResponseSchema';

export const AuthenticatorAttestationResponseBrowserSchema =
  AuthenticatorAttestationResponseSchema.extend({
    attestationObject: BytesArrayBufferBrowserSchemaCodec,
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
  });
