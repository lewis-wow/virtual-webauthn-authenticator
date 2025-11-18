import { Exception } from '../Exception';

export const LENGTH_REQUIRED = 'LENGTH_REQUIRED';

export class LengthRequired extends Exception {
  status = 411;
  code = LENGTH_REQUIRED;

  constructor(message = 'Length Required.') {
    super({
      message,
    });
  }
}
