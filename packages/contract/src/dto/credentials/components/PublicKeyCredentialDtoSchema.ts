import { BytesSchemaCodec } from '@repo/core/zod-validation';
import { PublicKeyCredentialSchema } from '@repo/virtual-authenticator/validation';
import { z } from 'zod';

import { AuthenticatorAssertionResponseDtoSchema } from './AuthenticatorAssertionResponseDtoSchema';
import { AuthenticatorAttestationResponseDtoSchema } from './AuthenticatorAttestationResponseDtoSchema';

export const PublicKeyCredentialDtoSchema = PublicKeyCredentialSchema.extend({
  rawId: BytesSchemaCodec,
  response: z.union([
    AuthenticatorAttestationResponseDtoSchema,
    AuthenticatorAssertionResponseDtoSchema,
  ]),
});
