import { Exception } from '../Exception';

export const NOT_EXTENDED = 'NOT_EXTENDED';

export class NotExtended extends Exception {
  static status = 510;
  static code = NOT_EXTENDED;

  constructor(message = 'Not Extended.') {
    super({
      message,
    });
  }
}
