import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class Unauthorized extends Exception {
  static status = HttpStatusCode.UNAUTHORIZED;
  static readonly code = 'Unauthorized';
  static message = 'User is not authorized.';
}
