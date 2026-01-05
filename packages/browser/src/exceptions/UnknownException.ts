import { Exception } from '@repo/exception';

export class UnknownException extends Exception {
  message = 'Unknown exception.';
}
