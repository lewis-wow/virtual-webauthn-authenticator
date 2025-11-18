import { Exception } from '../Exception';

export const REQUEST_HEADER_FIELDS_TOO_LARGE =
  'REQUEST_HEADER_FIELDS_TOO_LARGE';

export class RequestHeaderFieldsTooLarge extends Exception {
  status = 431;
  code = REQUEST_HEADER_FIELDS_TOO_LARGE;

  constructor(message = 'Request Header Fields Too Large.') {
    super({
      message,
    });
  }
}
