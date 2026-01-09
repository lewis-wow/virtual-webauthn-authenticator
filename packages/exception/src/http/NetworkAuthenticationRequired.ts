import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class NetworkAuthenticationRequired extends Exception {
  static status = HttpStatusCode.NETWORK_AUTHENTICATION_REQUIRED;
  static readonly name = 'NetworkAuthenticationRequired';
  static message = 'Network Authentication Required.';
}
