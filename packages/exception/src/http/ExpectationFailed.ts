import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class ExpectationFailed extends Exception {
  static status = HttpStatusCode.EXPECTATION_FAILED_417;
  static readonly code = 'ExpectationFailed';
  static message = 'Expectation Failed.';
}
