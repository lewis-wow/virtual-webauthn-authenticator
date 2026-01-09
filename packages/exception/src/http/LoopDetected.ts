import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class LoopDetected extends Exception {
  static status = HttpStatusCode.LOOP_DETECTED;
  static readonly name = 'LoopDetected';
  static message = 'Loop Detected.';
}
