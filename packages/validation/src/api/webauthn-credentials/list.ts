import z from 'zod';

import { WebAuthnCredentialSchema } from '../../models/webauthn-credential/WebAuthnCredentialSchema';

export const ListWebAuthnCredentialsResponseSchema = z.array(
  WebAuthnCredentialSchema,
);
