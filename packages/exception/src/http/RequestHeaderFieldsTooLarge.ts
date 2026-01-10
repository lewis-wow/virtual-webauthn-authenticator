import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class RequestHeaderFieldsTooLarge extends Exception {
  static status = HttpStatusCode.REQUEST_HEADER_FIELDS_TOO_LARGE_431;
  static readonly code = 'RequestHeaderFieldsTooLarge';
  static message = 'Request Header Fields Too Large.';
}
