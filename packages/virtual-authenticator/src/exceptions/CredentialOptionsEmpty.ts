import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class CredentialOptionsEmpty extends Exception {
  static status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'CredentialOptionsEmpty';
  static message = 'Credential options empty.';
}
