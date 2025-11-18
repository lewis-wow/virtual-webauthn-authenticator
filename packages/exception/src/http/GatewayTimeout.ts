import { Exception } from '../Exception';

export const GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT';

export class GatewayTimeout extends Exception {
  status = 504;
  code = GATEWAY_TIMEOUT;

  constructor(message = 'Gateway Timeout.') {
    super({
      message,
    });
  }
}
