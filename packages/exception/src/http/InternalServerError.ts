import { Exception } from '../Exception';

export const INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR';

export class InternalServerError extends Exception {
  status = 500;
  code = INTERNAL_SERVER_ERROR;

  constructor(message = 'Internal Server Error.') {
    super({
      message,
    });
  }
}
