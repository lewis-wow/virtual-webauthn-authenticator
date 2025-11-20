import { Exception } from '../Exception';

export const LOCKED = 'LOCKED';

export class Locked extends Exception {
  static status = 423;
  static code = LOCKED;

  constructor(message = 'Locked.') {
    super({
      message,
    });
  }
}
