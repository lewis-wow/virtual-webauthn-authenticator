import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class HTTPVersionNotSupported extends Exception {
  static status = HttpStatusCode.HTTP_VERSION_NOT_SUPPORTED_505;
  static readonly code = 'HTTPVersionNotSupported';
  static message = 'HTTP Version Not Supported.';
}
