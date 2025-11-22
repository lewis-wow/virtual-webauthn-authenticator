import { Exception } from '../Exception';

export const TOO_EARLY = 'TOO_EARLY';

export class TooEarly extends Exception {
  static status = 425;
  static code = TOO_EARLY;

  constructor(message = 'Too Early.') {
    super({
      message,
    });
  }
}
