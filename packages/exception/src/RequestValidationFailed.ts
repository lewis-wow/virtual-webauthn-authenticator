import { Exception } from './Exception';

export const REQUEST_VALIDATION_FAILED = 'REQUEST_VALIDATION_FAILED';

export class RequestValidationFailed extends Exception {
  status = 400;
  code = REQUEST_VALIDATION_FAILED;
  message = 'Request validation failed.';
}
