import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class ServiceUnavailable extends Exception {
  static status = HttpStatusCode.SERVICE_UNAVAILABLE;
  static readonly code = 'ServiceUnavailable';
  static message = 'Service Unavailable.';
}
