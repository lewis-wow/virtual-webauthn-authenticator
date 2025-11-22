import { Exception } from '../Exception';

export const NOT_FOUND = 'NOT_FOUND';

export class NotFound extends Exception {
  static status = 404;
  static code = NOT_FOUND;

  constructor(message = 'Not Found.') {
    super({
      message,
    });
  }
}
