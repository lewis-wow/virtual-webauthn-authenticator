import z from 'zod';

import { see } from '../meta/see';
import { PublicKeyCredentialTypeSchema } from './enums/PublicKeyCredentialTypeSchema';

/**
 * @see https://w3c.github.io/webappsec-credential-management/#credential
 */
export const CredentialSchema = z
  .object({
    id: z
      .base64url()
      .meta({ description: 'The Base64URL-encoded credential ID.' }),
    type: PublicKeyCredentialTypeSchema,
  })
  .meta({
    id: 'CredentialSchema',
    description: `${see('https://w3c.github.io/webappsec-credential-management/#credential')}`,
  });

export type Credential = z.infer<typeof CredentialSchema>;
