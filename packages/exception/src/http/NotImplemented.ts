import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class NotImplemented extends Exception {
  static status = HttpStatusCode.NOT_IMPLEMENTED;
  static readonly code = 'NotImplemented';
  static message = 'Not Implemented.';
}
