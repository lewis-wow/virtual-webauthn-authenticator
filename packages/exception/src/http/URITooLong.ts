import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class URITooLong extends Exception {
  static status = HttpStatusCode.URI_TOO_LONG;
  static readonly name = 'URITooLong';
  static message = 'URI Too Long.';
}
