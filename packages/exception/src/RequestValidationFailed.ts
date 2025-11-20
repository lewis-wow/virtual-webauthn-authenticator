import { Exception } from './Exception';

export const REQUEST_VALIDATION_FAILED = 'REQUEST_VALIDATION_FAILED';

export class RequestValidationFailed extends Exception {
  static status = 400;
  static code = REQUEST_VALIDATION_FAILED;
  static message = 'Request validation failed.';
}
