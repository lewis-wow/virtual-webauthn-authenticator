import { SetMetadata } from '@nestjs/common';
import type { RuleFunc } from '@repo/auth';

export const PERMISSION_FUNCTION_KEY = 'PERMISSION_FUNCTION';

export const CheckPermissions = (ruleFunc: RuleFunc) =>
  SetMetadata(PERMISSION_FUNCTION_KEY, ruleFunc);
