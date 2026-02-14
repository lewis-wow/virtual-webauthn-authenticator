import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class CreateCredentialActionNotDefined extends Exception {
  static readonly status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'CreateCredentialActionNotDefined';
  static readonly message = 'Create credential action not defined.';
}
