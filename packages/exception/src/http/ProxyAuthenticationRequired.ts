import { Exception } from '../Exception';

export const PROXY_AUTHENTICATION_REQUIRED =
  'PROXY_AUTHENTICATION_REQUIRED';

export class ProxyAuthenticationRequired extends Exception {
  status = 407;
  code = PROXY_AUTHENTICATION_REQUIRED;

  constructor(message = 'Proxy Authentication Required.') {
    super({
      message,
    });
  }
}
