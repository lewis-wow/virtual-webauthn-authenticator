import { BytesSchemaCodec } from '@repo/core/zod-validation';

import { AuthenticatorGetAssertionResponseSchema } from '../../validation/authenticator/AuthenticatorGetAssertionResponseSchema';

/**
 * @see https://www.w3.org/TR/webauthn-3/#authenticatorGetAssertion-return-values
 * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#authenticatorGetAssertion
 */
export const AuthenticatorGetAssertionResponseDtoSchema =
  AuthenticatorGetAssertionResponseSchema.extend({
    credentialId: BytesSchemaCodec,
    authenticatorData: BytesSchemaCodec,
    signature: BytesSchemaCodec,
    userHandle: BytesSchemaCodec.nullable(),
  });
