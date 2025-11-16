import { AuthenticatorResponseSchema } from '../../models/credentials/AuthenticatorResponseSchema';
import { BytesArrayBufferBrowserSchemaCodec } from '../BytesArrayBufferBrowserSchemaCodec';

export const AuthenticatorResponseBrowserSchema =
  AuthenticatorResponseSchema.extend({
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
  });
