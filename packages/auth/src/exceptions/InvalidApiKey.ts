import { Exception } from '@repo/exception';

export const INVALID_API_KEY = 'INVALID_API_KEY';

export class InvalidApiKey extends Exception {
  static status = 401;
  static code = INVALID_API_KEY;
  static message = 'Invalid API key.';
}
