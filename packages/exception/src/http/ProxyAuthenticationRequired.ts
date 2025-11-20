import { Exception } from '../Exception';

export const PROXY_AUTHENTICATION_REQUIRED =
  'PROXY_AUTHENTICATION_REQUIRED';

export class ProxyAuthenticationRequired extends Exception {
  static status = 407;
  static code = PROXY_AUTHENTICATION_REQUIRED;

  constructor(message = 'Proxy Authentication Required.') {
    super({
      message,
    });
  }
}
