import { Exception } from '../Exception';

export const UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY';

export class UnprocessableEntity extends Exception {
  static status = 422;
  static code = UNPROCESSABLE_ENTITY;

  constructor(message = 'Unprocessable Entity.') {
    super({
      message,
    });
  }
}
