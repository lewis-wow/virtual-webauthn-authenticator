import { Exception } from '@repo/exception';

export const METHOD_NOT_IMPLEMENTED = 'METHOD_NOT_IMPLEMENTED';

export class MethodNotImplemented extends Exception {
  static code = METHOD_NOT_IMPLEMENTED;
  static message = 'Method not implemented';
}
