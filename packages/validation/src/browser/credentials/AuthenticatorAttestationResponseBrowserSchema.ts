import { AuthenticatorAttestationResponseSchema } from '../../models/credentials/AuthenticatorAttestationResponseSchema';
import { BytesArrayBufferBrowserSchemaCodec } from '../BytesArrayBufferBrowserSchemaCodec';

export const AuthenticatorAttestationResponseBrowserSchema =
  AuthenticatorAttestationResponseSchema.extend({
    attestationObject: BytesArrayBufferBrowserSchemaCodec,
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
  });
