import { Exception } from '../Exception';

export const I_M_A_TEAPOT = 'I_M_A_TEAPOT';

export class ImATeapot extends Exception {
  status = 418;
  code = I_M_A_TEAPOT;

  constructor(message = 'I am a teapot.') {
    super({
      message,
    });
  }
}
