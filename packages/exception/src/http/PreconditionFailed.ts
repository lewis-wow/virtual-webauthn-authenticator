import { Exception } from '../Exception';

export const PRECONDITION_FAILED = 'PRECONDITION_FAILED';

export class PreconditionFailed extends Exception {
  status = 412;
  code = PRECONDITION_FAILED;

  constructor(message = 'Precondition Failed.') {
    super({
      message,
    });
  }
}
