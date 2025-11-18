import { Exception } from '../Exception';

export const UPGRADE_REQUIRED = 'UPGRADE_REQUIRED';

export class UpgradeRequired extends Exception {
  status = 426;
  code = UPGRADE_REQUIRED;

  constructor(message = 'Upgrade Required.') {
    super({
      message,
    });
  }
}
