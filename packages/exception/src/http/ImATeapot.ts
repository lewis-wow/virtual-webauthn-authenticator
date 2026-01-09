import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class ImATeapot extends Exception {
  static status = HttpStatusCode.IM_A_TEAPOT;
  static readonly name = 'ImATeapot';
  static message = 'I am a teapot.';
}
