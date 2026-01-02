/**
 * Creates a context error message for React hooks that require a specific provider.
 * This is a common pattern for hooks that must be used within a provider component.
 *
 * @param hookName - The name of the hook (e.g., 'useFormField', 'useSidebar')
 * @param providerName - The name of the provider component (e.g., 'FormField', 'SidebarProvider')
 * @returns Error message string
 *
 * @example
 * ```ts
 * if (!context) {
 *   throw new Error(createContextErrorMessage('useFormField', 'FormField'));
 * }
 * ```
 */
export const createContextErrorMessage = (
  hookName: string,
  providerName: string,
): string => {
  return `${hookName} must be used within ${providerName}`;
};
