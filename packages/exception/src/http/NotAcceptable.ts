import { Exception } from '../Exception';

export const NOT_ACCEPTABLE = 'NOT_ACCEPTABLE';

export class NotAcceptable extends Exception {
  status = 406;
  code = NOT_ACCEPTABLE;

  constructor(message = 'Not Acceptable.') {
    super({
      message,
    });
  }
}
