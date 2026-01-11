import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class Unauthorized extends Exception {
  static status = HttpStatusCode.UNAUTHORIZED_401;
  static readonly code = 'Unauthorized';
  static message = 'User is not authorized.';
}
