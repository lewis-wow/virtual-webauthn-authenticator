import { Exception } from '@repo/exception';

export const INVALID_API_KEY = 'INVALID_API_KEY';

export class InvalidApiKey extends Exception {
  status = 401;
  code = INVALID_API_KEY;
  message = 'Invalid API key.';
}
