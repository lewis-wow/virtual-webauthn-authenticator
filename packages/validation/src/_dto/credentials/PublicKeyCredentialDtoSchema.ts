import { z } from 'zod';

import { PublicKeyCredentialSchema } from '../../models/credentials/PublicKeyCredentialSchema';
import { BytesDtoSchema } from '../common/BytesDtoSchema';
import { AuthenticatorAssertionResponseDtoSchema } from './AuthenticatorAssertionResponseDtoSchema';
import { AuthenticatorAttestationResponseDtoSchema } from './AuthenticatorAttestationResponseDtoSchema';

export const PublicKeyCredentialDtoSchema = PublicKeyCredentialSchema.extend({
  rawId: BytesDtoSchema,
  response: z.union([
    AuthenticatorAttestationResponseDtoSchema,
    AuthenticatorAssertionResponseDtoSchema,
  ]),
});

export type PublicKeyCredentialDto = typeof PublicKeyCredentialDtoSchema;
