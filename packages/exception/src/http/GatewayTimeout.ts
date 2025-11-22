import { Exception } from '../Exception';

export const GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT';

export class GatewayTimeout extends Exception {
  static status = 504;
  static code = GATEWAY_TIMEOUT;

  constructor(message = 'Gateway Timeout.') {
    super({
      message,
    });
  }
}
