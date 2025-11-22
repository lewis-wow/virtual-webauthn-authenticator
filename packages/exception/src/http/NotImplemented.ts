import { Exception } from '../Exception';

export const NOT_IMPLEMENTED = 'NOT_IMPLEMENTED';

export class NotImplemented extends Exception {
  static status = 501;
  static code = NOT_IMPLEMENTED;

  constructor(message = 'Not Implemented.') {
    super({
      message,
    });
  }
}
