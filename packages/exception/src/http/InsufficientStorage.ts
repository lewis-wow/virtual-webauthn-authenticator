import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class InsufficientStorage extends Exception {
  static status = HttpStatusCode.INSUFFICIENT_STORAGE_507;
  static readonly code = 'InsufficientStorage';
  static message = 'Insufficient Storage.';
}
