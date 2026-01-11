import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class PreconditionFailed extends Exception {
  static status = HttpStatusCode.PRECONDITION_FAILED_412;
  static readonly code = 'PreconditionFailed';
  static message = 'Precondition Failed.';
}
