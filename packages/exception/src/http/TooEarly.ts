import { Exception } from '../Exception';

export const TOO_EARLY = 'TOO_EARLY';

export class TooEarly extends Exception {
  status = 425;
  code = TOO_EARLY;

  constructor(message = 'Too Early.') {
    super({
      message,
    });
  }
}
