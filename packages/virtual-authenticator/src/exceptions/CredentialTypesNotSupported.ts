import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class CredentialTypesNotSupported extends Exception {
  static status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'CredentialTypesNotSupported';
  static message = 'Credential types not supported.';
}
