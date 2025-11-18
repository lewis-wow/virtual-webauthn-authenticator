import { BytesArrayBufferBrowserSchemaCodec } from '../../../../validation/src/browser/BytesArrayBufferBrowserSchemaCodec';
import { AuthenticatorAssertionResponseSchema } from '../../models/credentials/AuthenticatorAssertionResponseSchema';
import { UserHandleBrowserSchema } from './UserHandleBrowserSchema';

export const AuthenticatorAssertionResponseBrowserSchema =
  AuthenticatorAssertionResponseSchema.extend({
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
    authenticatorData: BytesArrayBufferBrowserSchemaCodec,
    signature: BytesArrayBufferBrowserSchemaCodec,
    userHandle: UserHandleBrowserSchema.nullable(),
  });
