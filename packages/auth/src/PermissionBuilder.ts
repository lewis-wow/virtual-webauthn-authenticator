import type { MaybePromise } from '@repo/types';

import type { Permission } from './enums/Permission';
import type { JwtPayload } from './validation/JwtPayloadSchema';

export type RuleFunc = (jwtPayload: JwtPayload) => MaybePromise<boolean>;

export class PermissionBuilder {
  static or(...rules: (RuleFunc | Permission)[]): RuleFunc {
    const ruleFuncs = rules.filter((rule) => typeof rule === 'function');
    const rulePermissions = rules.filter((rule) => typeof rule === 'string');

    return async (jwtPayload) => {
      const ruleFuncsResult = await Promise.all(
        ruleFuncs.map(async (ruleFunc) => await ruleFunc(jwtPayload)),
      ).then((results) => results.some((result) => result === true));

      const rulePermissionsResult = rulePermissions.some((permission) =>
        jwtPayload.permissions?.includes(permission),
      );

      return ruleFuncsResult || rulePermissionsResult;
    };
  }

  static and(...rules: (RuleFunc | Permission)[]): RuleFunc {
    const ruleFuncs = rules.filter((rule) => typeof rule === 'function');
    const rulePermissions = rules.filter((rule) => typeof rule === 'string');

    return async (jwtPayload) => {
      const ruleFuncsResult = await Promise.all(
        ruleFuncs.map(async (ruleFunc) => await ruleFunc(jwtPayload)),
      ).then((results) => results.every((result) => result === true));

      const rulePermissionsResult = rulePermissions.every((permission) =>
        jwtPayload.permissions?.includes(permission),
      );

      return ruleFuncsResult && rulePermissionsResult;
    };
  }
}
