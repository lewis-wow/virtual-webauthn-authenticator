import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class UnprocessableEntity extends Exception {
  static status = HttpStatusCode.UNPROCESSABLE_ENTITY;
  static readonly code = 'UnprocessableEntity';
  static message = 'Unprocessable Entity.';
}
