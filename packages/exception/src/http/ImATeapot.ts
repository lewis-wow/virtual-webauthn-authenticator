import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class ImATeapot extends Exception {
  static status = HttpStatusCode.IM_A_TEAPOT_418;
  static readonly code = 'ImATeapot';
  static message = 'I am a teapot.';
}
