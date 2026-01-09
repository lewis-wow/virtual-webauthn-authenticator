import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class PreconditionFailed extends Exception {
  static status = HttpStatusCode.PRECONDITION_FAILED;
  static readonly name = 'PreconditionFailed';
  static message = 'Precondition Failed.';
}
