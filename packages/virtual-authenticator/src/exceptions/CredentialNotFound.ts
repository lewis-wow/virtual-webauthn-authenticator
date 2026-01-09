import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class CredentialNotFound extends Exception {
  static status = HttpStatusCode.NOT_FOUND;
  static readonly name = 'CredentialNotFound';
  static message = 'Credential not found.';
}
