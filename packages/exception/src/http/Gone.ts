import { Exception } from '../Exception';

export const GONE = 'GONE';

export class Gone extends Exception {
  status = 410;
  code = GONE;

  constructor(message = 'Gone.') {
    super({
      message,
    });
  }
}
