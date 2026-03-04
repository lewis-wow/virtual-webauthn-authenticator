import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class VirtualAuthenticatorNotFound extends Exception {
  static status = HttpStatusCode.NOT_FOUND_404;
  static readonly code = 'VirtualAuthenticatorNotFound';
  static message = 'Virtual Authenticator Not Found.';
}
