import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class FailedDependency extends Exception {
  static status = HttpStatusCode.FAILED_DEPENDENCY_424;
  static readonly code = 'FailedDependency';
  static message = 'Failed Dependency.';
}
