import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class NotFound extends Exception {
  static status = HttpStatusCode.NOT_FOUND;
  static readonly code = 'NotFound';
  static message = 'Not Found.';
}
