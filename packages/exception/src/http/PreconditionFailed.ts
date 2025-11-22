import { Exception } from '../Exception';

export const PRECONDITION_FAILED = 'PRECONDITION_FAILED';

export class PreconditionFailed extends Exception {
  static status = 412;
  static code = PRECONDITION_FAILED;

  constructor(message = 'Precondition Failed.') {
    super({
      message,
    });
  }
}
