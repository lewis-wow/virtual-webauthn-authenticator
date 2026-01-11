import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class Conflict extends Exception {
  static status = HttpStatusCode.CONFLICT_409;
  static readonly code = 'Conflict';
  static message = 'Conflict.';
}
