import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class VirtualAuthenticatorNotFound extends Exception {
  static readonly status = HttpStatusCode.NOT_FOUND_404;
  static readonly code = 'VirtualAuthenticatorNotFound';
  static readonly message = 'Virtual Authenticator not found.';
}
