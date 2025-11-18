import { Exception } from '../Exception';

export const BAD_REQUEST = 'BAD_REQUEST';

export class BadRequest extends Exception {
  status = 400;
  code = BAD_REQUEST;

  constructor(message = 'Bad request.') {
    super({
      message,
    });
  }
}
