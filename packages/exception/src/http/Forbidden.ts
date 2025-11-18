import { Exception } from '../Exception';

export const FORBIDDEN = 'FORBIDDEN';

export class Forbidden extends Exception {
  status = 403;
  code = FORBIDDEN;

  constructor(message = 'Forbidden.') {
    super({
      message,
    });
  }
}
