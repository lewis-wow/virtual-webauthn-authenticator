import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class PreconditionRequired extends Exception {
  static status = HttpStatusCode.PRECONDITION_REQUIRED_428;
  static readonly code = 'PreconditionRequired';
  static message = 'Precondition Required.';
}
