import { Exception } from '../Exception';

export const LENGTH_REQUIRED = 'LENGTH_REQUIRED';

export class LengthRequired extends Exception {
  static status = 411;
  static code = LENGTH_REQUIRED;

  constructor(message = 'Length Required.') {
    super({
      message,
    });
  }
}
