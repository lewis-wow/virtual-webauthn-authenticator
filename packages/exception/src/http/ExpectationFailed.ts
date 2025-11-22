import { Exception } from '../Exception';

export const EXPECTATION_FAILED = 'EXPECTATION_FAILED';

export class ExpectationFailed extends Exception {
  static status = 417;
  static code = EXPECTATION_FAILED;

  constructor(message = 'Expectation Failed.') {
    super({
      message,
    });
  }
}
