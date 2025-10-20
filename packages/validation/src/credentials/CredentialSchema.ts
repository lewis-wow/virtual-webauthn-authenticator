import { PublicKeyCredentialTypeSchema } from '@repo/enums';
import z from 'zod';

/**
 * @see https://w3c.github.io/webappsec-credential-management/#credential
 */
export const CredentialSchema = z.object({
  id: z.string().describe('The Base64URL-encoded credential ID.'),
  type: PublicKeyCredentialTypeSchema,
});
