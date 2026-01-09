import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class HTTPVersionNotSupported extends Exception {
  static status = HttpStatusCode.HTTP_VERSION_NOT_SUPPORTED;
  static readonly name = 'HTTPVersionNotSupported';
  static message = 'HTTP Version Not Supported.';
}
