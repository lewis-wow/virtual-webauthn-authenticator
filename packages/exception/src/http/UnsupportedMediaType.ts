import { Exception } from '../Exception';

export const UNSUPPORTED_MEDIA_TYPE = 'UNSUPPORTED_MEDIA_TYPE';

export class UnsupportedMediaType extends Exception {
  static status = 415;
  static code = UNSUPPORTED_MEDIA_TYPE;

  constructor(message = 'Unsupported Media Type.') {
    super({
      message,
    });
  }
}
