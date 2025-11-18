import { Exception } from '../Exception';

export const CONFLICT = 'CONFLICT';

export class Conflict extends Exception {
  status = 409;
  code = CONFLICT;

  constructor(message = 'Conflict.') {
    super({
      message,
    });
  }
}
