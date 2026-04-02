import { Exception } from '@repo/exception';
import { Prisma } from '@repo/prisma';
import { PrismaErrorCode } from '@repo/prisma/enums';

/**
 * Handles Prisma errors and throws appropriate application exceptions.
 * Specifically useful for handling "record not found" errors.
 *
 * @param opts - Error handling options
 * @throws The provided exception if the error is a not-found error
 * @throws The original error if it's not a known Prisma error
 *
 * @example
 * try {
 *   await prisma.virtualAuthenticator.delete({ where: { id } });
 * } catch (error) {
 *   handlePrismaNotFoundError({
 *     error,
 *     notFoundException: new VirtualAuthenticatorNotFound(),
 *   });
 *   throw error;
 * }
 */
export const handlePrismaNotFoundError = (opts: {
  error: unknown;
  notFoundException: Exception;
}): void => {
  const { error, notFoundException } = opts;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === PrismaErrorCode.RECORDS_NOT_FOUND) {
      throw notFoundException;
    }
  }
};
