import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class NotFound extends Exception {
  static status = HttpStatusCode.NOT_FOUND_404;
  static readonly code = 'NotFound';
  static message = 'Not Found.';
}
