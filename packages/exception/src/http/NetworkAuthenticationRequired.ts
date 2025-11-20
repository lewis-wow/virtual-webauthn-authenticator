import { Exception } from '../Exception';

export const NETWORK_AUTHENTICATION_REQUIRED =
  'NETWORK_AUTHENTICATION_REQUIRED';

export class NetworkAuthenticationRequired extends Exception {
  static status = 511;
  static code = NETWORK_AUTHENTICATION_REQUIRED;

  constructor(message = 'Network Authentication Required.') {
    super({
      message,
    });
  }
}
