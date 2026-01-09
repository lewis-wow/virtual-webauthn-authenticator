import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class GatewayTimeout extends Exception {
  static status = HttpStatusCode.GATEWAY_TIMEOUT;
  static readonly name = 'GatewayTimeout';
  static message = 'Gateway Timeout.';
}
