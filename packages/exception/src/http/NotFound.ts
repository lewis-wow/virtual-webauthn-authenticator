import { Exception } from '../Exception';

export const NOT_FOUND = 'NOT_FOUND';

export class NotFound extends Exception {
  status = 404;
  code = NOT_FOUND;

  constructor(message = 'Not Found.') {
    super({
      message,
    });
  }
}
