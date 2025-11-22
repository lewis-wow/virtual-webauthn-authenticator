import { Exception } from '../Exception';

export const BAD_REQUEST = 'BAD_REQUEST';

export class BadRequest extends Exception {
  static status = 400;
  static code = BAD_REQUEST;

  constructor(message = 'Bad request.') {
    super({
      message,
    });
  }
}
