import { Exception } from '../Exception';

export const METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED';

export class MethodNotAllowed extends Exception {
  static status = 405;
  static code = METHOD_NOT_ALLOWED;

  constructor(message = 'Method Not Allowed.') {
    super({
      message,
    });
  }
}
