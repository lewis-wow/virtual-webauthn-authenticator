import z from 'zod';

import { WebAuthnCredentialSchemaCodec } from '../../models/webauthn-credential/WebAuthnCredentialSchema';

export const GetWebAuthnCredentialRequestPathParamsSchema = z.object({
  id: z.uuid(),
});

export const GetWebAuthnCredentialResponseSchema =
  WebAuthnCredentialSchemaCodec;
