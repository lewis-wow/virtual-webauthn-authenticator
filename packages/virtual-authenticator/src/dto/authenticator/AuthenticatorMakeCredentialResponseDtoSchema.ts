import { BytesSchemaCodec } from '@repo/core/zod-validation';

import { AuthenticatorMakeCredentialResponseSchema } from '../../validation/authenticator/AuthenticatorMakeCredentialResponseSchema';

/**
 * @see https://www.w3.org/TR/webauthn-3/#attestation-object
 * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#sctn-makeCred-authnr-alg
 */
export const AuthenticatorMakeCredentialResponseDtoSchema =
  AuthenticatorMakeCredentialResponseSchema.extend({
    attestationObject: BytesSchemaCodec,
    credentialId: BytesSchemaCodec,
  });
