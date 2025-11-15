import { z } from 'zod';

import { PublicKeyCredentialSchema } from '../../models/credentials/PublicKeyCredentialSchema';
import { BytesSchemaCodec } from '../common/BytesSchemaCodec';
import { AuthenticatorAssertionResponseDtoSchema } from './AuthenticatorAssertionResponseDtoSchema';
import { AuthenticatorAttestationResponseDtoSchema } from './AuthenticatorAttestationResponseDtoSchema';

export const PublicKeyCredentialDtoSchema = PublicKeyCredentialSchema.extend({
  rawId: BytesSchemaCodec,
  response: z.union([
    AuthenticatorAttestationResponseDtoSchema,
    AuthenticatorAssertionResponseDtoSchema,
  ]),
});

export type PublicKeyCredentialDto = typeof PublicKeyCredentialDtoSchema;
