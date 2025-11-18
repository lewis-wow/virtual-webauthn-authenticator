import { Exception } from '../Exception';

export const LOCKED = 'LOCKED';

export class Locked extends Exception {
  status = 423;
  code = LOCKED;

  constructor(message = 'Locked.') {
    super({
      message,
    });
  }
}
