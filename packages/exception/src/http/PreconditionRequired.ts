import { Exception } from '../Exception';

export const PRECONDITION_REQUIRED = 'PRECONDITION_REQUIRED';

export class PreconditionRequired extends Exception {
  static status = 428;
  static code = PRECONDITION_REQUIRED;

  constructor(message = 'Precondition Required.') {
    super({
      message,
    });
  }
}
