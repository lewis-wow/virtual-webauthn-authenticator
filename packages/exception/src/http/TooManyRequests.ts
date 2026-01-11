import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class TooManyRequests extends Exception {
  static status = HttpStatusCode.TOO_MANY_REQUESTS_429;
  static readonly code = 'TooManyRequests';
  static message = 'Too Many Requests.';
}
