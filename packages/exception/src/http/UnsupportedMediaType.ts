import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class UnsupportedMediaType extends Exception {
  static status = HttpStatusCode.UNSUPPORTED_MEDIA_TYPE;
  static readonly code = 'UnsupportedMediaType';
  static message = 'Unsupported Media Type.';
}
