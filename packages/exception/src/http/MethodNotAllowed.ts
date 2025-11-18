import { Exception } from '../Exception';

export const METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED';

export class MethodNotAllowed extends Exception {
  status = 405;
  code = METHOD_NOT_ALLOWED;

  constructor(message = 'Method Not Allowed.') {
    super({
      message,
    });
  }
}
