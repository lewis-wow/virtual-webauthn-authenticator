import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export abstract class Interruption extends Exception {
  static status = HttpStatusCode.PRECONDITION_REQUIRED;
  static name = 'Interruption';
}
