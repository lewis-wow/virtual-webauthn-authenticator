import { Exception } from '../Exception';

export const FAILED_DEPENDENCY = 'FAILED_DEPENDENCY';

export class FailedDependency extends Exception {
  status = 424;
  code = FAILED_DEPENDENCY;

  constructor(message = 'Failed Dependency.') {
    super({
      message,
    });
  }
}
