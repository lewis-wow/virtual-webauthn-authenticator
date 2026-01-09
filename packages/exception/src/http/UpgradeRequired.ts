import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class UpgradeRequired extends Exception {
  static status = HttpStatusCode.UPGRADE_REQUIRED;
  static readonly name = 'UpgradeRequired';
  static message = 'Upgrade Required.';
}
