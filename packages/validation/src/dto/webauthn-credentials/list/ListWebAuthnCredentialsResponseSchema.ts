import z from 'zod';

import { WebAuthnCredentialDtoSchema } from '../WebAuthnCredentialDtoSchema';

export const ListWebAuthnCredentialsResponseSchema = z.array(
  WebAuthnCredentialDtoSchema,
);
