import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class NoActiveVirtualAuthenticator extends Exception {
  static status = HttpStatusCode.CONFLICT_409;
  static readonly code = 'NoActiveVirtualAuthenticator';
  static message = 'No Active Virtual Authenticator.';
}
