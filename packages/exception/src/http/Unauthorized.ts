import { Exception } from '../Exception';

export const UNAUTHORIZED = 'UNAUTHORIZED';

export class Unauthorized extends Exception {
  status = 401;
  code = UNAUTHORIZED;

  constructor(message = 'User is not authorized.') {
    super({
      message,
    });
  }
}
