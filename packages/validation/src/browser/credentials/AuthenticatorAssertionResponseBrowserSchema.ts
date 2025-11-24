import { AuthenticatorAssertionResponseSchema } from '../../models/credentials/AuthenticatorAssertionResponseSchema';
import { BytesArrayBufferBrowserSchemaCodec } from '../BytesArrayBufferBrowserSchemaCodec';
import { UserHandleBrowserSchema } from './UserHandleBrowserSchema';

export const AuthenticatorAssertionResponseBrowserSchema =
  AuthenticatorAssertionResponseSchema.extend({
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
    authenticatorData: BytesArrayBufferBrowserSchemaCodec,
    signature: BytesArrayBufferBrowserSchemaCodec,
    userHandle: UserHandleBrowserSchema.nullable(),
  });
