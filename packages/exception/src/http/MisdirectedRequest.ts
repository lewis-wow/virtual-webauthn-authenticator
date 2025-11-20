import { Exception } from '../Exception';

export const MISDIRECTED_REQUEST = 'MISDIRECTED_REQUEST';

export class MisdirectedRequest extends Exception {
  static status = 421;
  static code = MISDIRECTED_REQUEST;

  constructor(message = 'Misdirected Request.') {
    super({
      message,
    });
  }
}
