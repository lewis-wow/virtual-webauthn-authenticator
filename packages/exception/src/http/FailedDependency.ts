import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class FailedDependency extends Exception {
  static status = HttpStatusCode.FAILED_DEPENDENCY;
  static readonly name = 'FailedDependency';
  static message = 'Failed Dependency.';
}
