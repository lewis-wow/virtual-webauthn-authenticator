import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class AuthenticatorDataTooShort extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly code = 'AuthenticatorDataTooShort';
  static message = 'Authenticator data is too short';
}
