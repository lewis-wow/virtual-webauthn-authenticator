import { AuthenticatorAssertionResponseSchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesArrayBufferBrowserSchemaCodec } from '../codecs/BytesArrayBufferBrowserSchemaCodec';
import { UserHandleBrowserSchema } from './UserHandleBrowserSchema';

export const AuthenticatorAssertionResponseBrowserSchema =
  AuthenticatorAssertionResponseSchema.extend({
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
    authenticatorData: BytesArrayBufferBrowserSchemaCodec,
    signature: BytesArrayBufferBrowserSchemaCodec,
    userHandle: UserHandleBrowserSchema.nullable(),
  });
