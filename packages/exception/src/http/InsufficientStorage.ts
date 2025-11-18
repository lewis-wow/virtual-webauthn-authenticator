import { Exception } from '../Exception';

export const INSUFFICIENT_STORAGE = 'INSUFFICIENT_STORAGE';

export class InsufficientStorage extends Exception {
  status = 507;
  code = INSUFFICIENT_STORAGE;

  constructor(message = 'Insufficient Storage.') {
    super({
      message,
    });
  }
}
