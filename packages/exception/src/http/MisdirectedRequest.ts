import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class MisdirectedRequest extends Exception {
  static status = HttpStatusCode.MISDIRECTED_REQUEST;
  static readonly name = 'MisdirectedRequest';
  static message = 'Misdirected Request.';
}
