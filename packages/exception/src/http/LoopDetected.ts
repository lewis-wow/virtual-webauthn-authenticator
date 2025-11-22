import { Exception } from '../Exception';

export const LOOP_DETECTED = 'LOOP_DETECTED';

export class LoopDetected extends Exception {
  static status = 508;
  static code = LOOP_DETECTED;

  constructor(message = 'Loop Detected.') {
    super({
      message,
    });
  }
}
