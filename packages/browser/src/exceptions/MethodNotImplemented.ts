import { Exception } from '@repo/exception';

export const METHOD_NOT_IMPLEMENTED = 'METHOD_NOT_IMPLEMENTED';

export class MethodNotImplemented extends Exception {
  code = METHOD_NOT_IMPLEMENTED;
  message = 'Method not implemented';
}
