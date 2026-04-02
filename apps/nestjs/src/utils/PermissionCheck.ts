import { Forbidden } from '@repo/exception/http';

/**
 * Verifies that the given permissions array includes a required permission.
 * Throws Forbidden exception if the permission is not present.
 *
 * @param permissions - Array of user permissions
 * @param requiredPermission - The permission that must be included
 * @throws Forbidden if the required permission is not included
 *
 * @example
 * requirePermission(userPermissions, Permission['CREDENTIAL.CREATE']);
 */
export const requirePermission = (
  permissions: string[],
  requiredPermission: string,
): void => {
  if (!permissions.includes(requiredPermission)) {
    throw new Forbidden();
  }
};
