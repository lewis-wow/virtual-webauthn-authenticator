import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class MethodNotAllowed extends Exception {
  static status = HttpStatusCode.METHOD_NOT_ALLOWED;
  static readonly code = 'MethodNotAllowed';
  static message = 'Method Not Allowed.';
}
