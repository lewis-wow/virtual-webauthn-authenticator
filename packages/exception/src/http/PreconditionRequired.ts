import { Exception } from '../Exception';

export const PRECONDITION_REQUIRED = 'PRECONDITION_REQUIRED';

export class PreconditionRequired extends Exception {
  status = 428;
  code = PRECONDITION_REQUIRED;

  constructor(message = 'Precondition Required.') {
    super({
      message,
    });
  }
}
