export class PermissionMapper {
  /**
   * Converts form state object { "users": ["read", "write"] }
   * to flat tree IDs ["users.read", "users.write"]
   */
  static toTreeIds(permissions: Record<string, string[]>): string[] {
    if (!permissions) return [];

    return Object.entries(permissions).flatMap(([resource, actions]) =>
      actions.map((action) => `${resource}.${action}`),
    );
  }

  /**
   * Converts flat tree IDs ["users.read", "users.write"]
   * back to form state object { "users": ["read", "write"] }
   */
  static fromTreeIds(ids: string[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    ids.forEach((id) => {
      // We assume the separator is a dot.
      // We skip IDs without dots (e.g. "users") because they are just
      // parent folders, not actual permission values.
      if (!id.includes('.')) return;

      const [resource, action] = id.split('.') as [string, string];

      if (!result[resource]) {
        result[resource] = [];
      }

      // Avoid duplicates if checking logic is loose
      if (!result[resource].includes(action)) {
        result[resource].push(action);
      }
    });

    return result;
  }
}
