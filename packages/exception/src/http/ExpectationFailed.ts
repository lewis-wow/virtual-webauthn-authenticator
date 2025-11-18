import { Exception } from '../Exception';

export const EXPECTATION_FAILED = 'EXPECTATION_FAILED';

export class ExpectationFailed extends Exception {
  status = 417;
  code = EXPECTATION_FAILED;

  constructor(message = 'Expectation Failed.') {
    super({
      message,
    });
  }
}
