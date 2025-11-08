import z from 'zod';

import { WebAuthnCredentialSchemaCodec } from '../../models/webauthn-credential/WebAuthnCredentialSchema';

export const ListWebAuthnCredentialsResponseSchema = z.array(
  WebAuthnCredentialSchemaCodec,
);
