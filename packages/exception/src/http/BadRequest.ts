import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class BadRequest extends Exception {
  static status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'BadRequest';
  static message = 'Bad request.';
}
