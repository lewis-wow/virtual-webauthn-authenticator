import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class GetAssertionActionNotDefined extends Exception {
  static readonly status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'GetAssertionActionNotDefined';
  static readonly message = 'Get assertion action not defined.';
}
