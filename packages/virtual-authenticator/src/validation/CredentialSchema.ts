import { Schema } from 'effect';

import { see } from '../meta/see';
import { PublicKeyCredentialTypeSchema } from './enums/PublicKeyCredentialTypeSchema';

/**
 * @see https://w3c.github.io/webappsec-credential-management/#credential
 */
export const CredentialSchema = Schema.Struct({
  id: Schema.String.pipe(
    // Zod's base64url() validates that the string is Base64URL encoded.
    // We replicate this using a regex pattern: A-Z, a-z, 0-9, -, _
    Schema.pattern(/^[a-zA-Z0-9\-_]*$/, {
      message: () => 'Expected a Base64URL string',
    }),
  ).annotations({
    description: 'The Base64URL-encoded credential ID.',
  }),
  type: PublicKeyCredentialTypeSchema,
}).annotations({
  identifier: 'CredentialSchema',
  title: 'CredentialSchema',
  description: `${see(
    'https://w3c.github.io/webappsec-credential-management/#credential',
  )}`,
});

export type Credential = Schema.Schema.Type<typeof CredentialSchema>;
