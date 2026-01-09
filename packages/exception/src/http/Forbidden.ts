import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class Forbidden extends Exception {
  static status = HttpStatusCode.FORBIDDEN;
  static readonly code = 'Forbidden';
  static message = 'Forbidden.';
}
