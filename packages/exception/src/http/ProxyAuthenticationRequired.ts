import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class ProxyAuthenticationRequired extends Exception {
  static status = HttpStatusCode.PROXY_AUTHENTICATION_REQUIRED;
  static readonly name = 'ProxyAuthenticationRequired';
  static message = 'Proxy Authentication Required.';
}
