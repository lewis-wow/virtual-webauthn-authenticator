import { Exception } from '../Exception';

export const RANGE_NOT_SATISFIABLE = 'RANGE_NOT_SATISFIABLE';

export class RangeNotSatisfiable extends Exception {
  status = 416;
  code = RANGE_NOT_SATISFIABLE;

  constructor(message = 'Range Not Satisfiable.') {
    super({
      message,
    });
  }
}
