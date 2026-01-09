import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class RequestTimeout extends Exception {
  static status = HttpStatusCode.REQUEST_TIMEOUT;
  static readonly name = 'RequestTimeout';
  static message = 'Request Timeout.';
}
