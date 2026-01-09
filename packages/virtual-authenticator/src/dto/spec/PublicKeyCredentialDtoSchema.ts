import { BytesSchemaCodec } from '@repo/core/zod-validation';
import { z } from 'zod';

import { PublicKeyCredentialSchema } from '../../validation/spec/PublicKeyCredentialSchema';
import { AuthenticatorAssertionResponseDtoSchema } from './AuthenticatorAssertionResponseDtoSchema';
import { AuthenticatorAttestationResponseDtoSchema } from './AuthenticatorAttestationResponseDtoSchema';

export const PublicKeyCredentialDtoSchema = PublicKeyCredentialSchema.extend({
  rawId: BytesSchemaCodec,
  response: z.union([
    AuthenticatorAttestationResponseDtoSchema,
    AuthenticatorAssertionResponseDtoSchema,
  ]),
});
