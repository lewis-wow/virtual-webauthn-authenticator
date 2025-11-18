import { AuthenticatorAssertionResponseSchema } from '@repo/virtual-authenticator/validation';

import { BytesArrayBufferBrowserSchemaCodec } from '../BytesArrayBufferBrowserSchemaCodec';
import { UserHandleBrowserSchema } from './UserHandleBrowserSchema';

export const AuthenticatorAssertionResponseBrowserSchema =
  AuthenticatorAssertionResponseSchema.extend({
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
    authenticatorData: BytesArrayBufferBrowserSchemaCodec,
    signature: BytesArrayBufferBrowserSchemaCodec,
    userHandle: UserHandleBrowserSchema.nullable(),
  });
