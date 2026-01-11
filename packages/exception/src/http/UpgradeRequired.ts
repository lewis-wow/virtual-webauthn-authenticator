import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class UpgradeRequired extends Exception {
  static status = HttpStatusCode.UPGRADE_REQUIRED_426;
  static readonly code = 'UpgradeRequired';
  static message = 'Upgrade Required.';
}
