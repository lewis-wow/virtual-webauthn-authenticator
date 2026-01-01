import { Exception } from '@repo/exception';

export const CREDENTIAL_NOT_FOUND = 'CREDENTIAL_NOT_FOUND';

export class CredentialNotFound extends Exception {
  static code = CREDENTIAL_NOT_FOUND;
  static status = 404;
  static message = 'Credential not found.';
}
