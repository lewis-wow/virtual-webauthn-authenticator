import { Exception } from '../Exception';

export const LOOP_DETECTED = 'LOOP_DETECTED';

export class LoopDetected extends Exception {
  status = 508;
  code = LOOP_DETECTED;

  constructor(message = 'Loop Detected.') {
    super({
      message,
    });
  }
}
