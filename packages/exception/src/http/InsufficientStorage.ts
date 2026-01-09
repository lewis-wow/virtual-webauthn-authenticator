import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class InsufficientStorage extends Exception {
  static status = HttpStatusCode.INSUFFICIENT_STORAGE;
  static readonly name = 'InsufficientStorage';
  static message = 'Insufficient Storage.';
}
