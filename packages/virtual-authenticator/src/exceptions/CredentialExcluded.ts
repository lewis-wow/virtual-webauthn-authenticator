import { Exception } from '@repo/exception';

export const CREDENTIAL_EXCLUDED = 'CREDENTIAL_EXCLUDED';

export class CredentialExcluded extends Exception {
  // 409 Conflict is the standard HTTP status for "Resource already exists"
  static status = 409;
  static code = CREDENTIAL_EXCLUDED;

  static message = `Authenticator already contains a credential.`;
}
