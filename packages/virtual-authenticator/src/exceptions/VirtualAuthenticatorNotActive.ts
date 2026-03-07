import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class VirtualAuthenticatorNotActive extends Exception {
  static readonly status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'VirtualAuthenticatorNotActive';
  static readonly message = 'Virtual Authenticator is not active.';
}
