import { Exception } from '../Exception';

export const FORBIDDEN = 'FORBIDDEN';

export class Forbidden extends Exception {
  static status = 403;
  static code = FORBIDDEN;

  constructor(message = 'Forbidden.') {
    super({
      message,
    });
  }
}
