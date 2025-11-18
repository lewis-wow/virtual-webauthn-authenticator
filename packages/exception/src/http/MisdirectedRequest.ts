import { Exception } from '../Exception';

export const MISDIRECTED_REQUEST = 'MISDIRECTED_REQUEST';

export class MisdirectedRequest extends Exception {
  status = 421;
  code = MISDIRECTED_REQUEST;

  constructor(message = 'Misdirected Request.') {
    super({
      message,
    });
  }
}
