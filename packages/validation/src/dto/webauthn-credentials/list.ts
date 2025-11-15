import z from 'zod';

import { WebAuthnCredentialDtoSchema } from '../../_dto/webauthn-credential/WebAuthnCredentialDtoSchema';

export const ListWebAuthnCredentialsResponseSchema = z.array(
  WebAuthnCredentialDtoSchema,
);
