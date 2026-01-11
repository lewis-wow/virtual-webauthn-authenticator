import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class RequestTimeout extends Exception {
  static status = HttpStatusCode.REQUEST_TIMEOUT_408;
  static readonly code = 'RequestTimeout';
  static message = 'Request Timeout.';
}
