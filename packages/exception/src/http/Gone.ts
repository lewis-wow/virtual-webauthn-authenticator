import { Exception } from '../Exception';

export const GONE = 'GONE';

export class Gone extends Exception {
  static status = 410;
  static code = GONE;

  constructor(message = 'Gone.') {
    super({
      message,
    });
  }
}
