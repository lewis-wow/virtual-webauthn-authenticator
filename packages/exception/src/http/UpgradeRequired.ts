import { Exception } from '../Exception';

export const UPGRADE_REQUIRED = 'UPGRADE_REQUIRED';

export class UpgradeRequired extends Exception {
  static status = 426;
  static code = UPGRADE_REQUIRED;

  constructor(message = 'Upgrade Required.') {
    super({
      message,
    });
  }
}
