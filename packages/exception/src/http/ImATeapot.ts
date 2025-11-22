import { Exception } from '../Exception';

export const I_M_A_TEAPOT = 'I_M_A_TEAPOT';

export class ImATeapot extends Exception {
  static status = 418;
  static code = I_M_A_TEAPOT;

  constructor(message = 'I am a teapot.') {
    super({
      message,
    });
  }
}
