import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class MisdirectedRequest extends Exception {
  static status = HttpStatusCode.MISDIRECTED_REQUEST_421;
  static readonly code = 'MisdirectedRequest';
  static message = 'Misdirected Request.';
}
