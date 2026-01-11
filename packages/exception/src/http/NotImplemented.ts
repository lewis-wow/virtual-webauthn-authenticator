import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class NotImplemented extends Exception {
  static status = HttpStatusCode.NOT_IMPLEMENTED_501;
  static readonly code = 'NotImplemented';
  static message = 'Not Implemented.';
}
