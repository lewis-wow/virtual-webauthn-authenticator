import { Exception } from '../Exception';

export const NOT_IMPLEMENTED = 'NOT_IMPLEMENTED';

export class NotImplemented extends Exception {
  status = 501;
  code = NOT_IMPLEMENTED;

  constructor(message = 'Not Implemented.') {
    super({
      message,
    });
  }
}
