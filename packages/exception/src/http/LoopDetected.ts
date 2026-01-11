import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class LoopDetected extends Exception {
  static status = HttpStatusCode.LOOP_DETECTED_508;
  static readonly code = 'LoopDetected';
  static message = 'Loop Detected.';
}
