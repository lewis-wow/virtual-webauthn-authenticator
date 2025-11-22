import { Exception } from '../Exception';

export const CONFLICT = 'CONFLICT';

export class Conflict extends Exception {
  static status = 409;
  static code = CONFLICT;

  constructor(message = 'Conflict.') {
    super({
      message,
    });
  }
}
