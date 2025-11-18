import { Exception } from '../Exception';

export const HTTP_VERSION_NOT_SUPPORTED = 'HTTP_VERSION_NOT_SUPPORTED';

export class HTTPVersionNotSupported extends Exception {
  status = 505;
  code = HTTP_VERSION_NOT_SUPPORTED;

  constructor(message = 'HTTP Version Not Supported.') {
    super({
      message,
    });
  }
}
