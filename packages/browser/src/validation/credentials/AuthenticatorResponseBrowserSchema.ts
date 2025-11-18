import { BytesArrayBufferBrowserSchemaCodec } from '../../../../validation/src/browser/BytesArrayBufferBrowserSchemaCodec';
import { AuthenticatorResponseSchema } from '../../models/credentials/AuthenticatorResponseSchema';

export const AuthenticatorResponseBrowserSchema =
  AuthenticatorResponseSchema.extend({
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
  });
