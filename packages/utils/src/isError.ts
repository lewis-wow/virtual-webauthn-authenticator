/**
 * Type guard to check if an error is an instance of Error.
 * Useful for safely accessing Error properties in catch blocks.
 *
 * @param error - The error to check
 * @returns True if the error is an instance of Error
 *
 * @example
 * ```ts
 * try {
 *   // some code
 * } catch (error) {
 *   if (isError(error)) {
 *     logger.exception(error);
 *   }
 * }
 * ```
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
