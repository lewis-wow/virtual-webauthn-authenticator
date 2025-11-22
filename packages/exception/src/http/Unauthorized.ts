import { Exception } from '../Exception';

export const UNAUTHORIZED = 'UNAUTHORIZED';

export class Unauthorized extends Exception {
  static status = 401;
  static code = UNAUTHORIZED;

  constructor(message = 'User is not authorized.') {
    super({
      message,
    });
  }
}
