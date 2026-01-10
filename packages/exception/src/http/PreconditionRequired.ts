import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class PreconditionRequired extends Exception {
  static status = HttpStatusCode.PRECONDITION_REQUIRED;
  static readonly code = 'PreconditionRequired';
  static message = 'Precondition Required.';
}
