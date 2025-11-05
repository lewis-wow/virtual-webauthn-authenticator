import { HTTPExceptionCode } from '@repo/enums';
import { HTTPException } from '@repo/exception';
import { Prisma } from '@repo/prisma';

export class PrismaErrorMapper {
  /**
   * Maps an unknown error (ideally a Prisma error) to an HTTPException.
   * @param error The error to map.
   * @returns An instance of HTTPException.
   */
  static toHTTPException(error: unknown): HTTPException | null {
    // 2. Handle known Prisma request errors (P-codes)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          return new HTTPException({
            status: 409, // Conflict
            code: HTTPExceptionCode.CONFLICT,
            message: 'A record with this value already exists.',
            cause: error,
          });

        case 'P2025': // Record not found (e.g., in an update or delete)
          return new HTTPException({
            status: 404, // Not Found
            code: HTTPExceptionCode.NOT_FOUND,
            message: 'The requested record was not found.',
            cause: error,
          });

        case 'P2000': // Value too long for column
        case 'P2001': // Record not found (where clause)
        case 'P2011': // Null constraint violation
          return new HTTPException({
            status: 400, // Bad Request
            code: HTTPExceptionCode.BAD_REQUEST,
            message: 'Invalid input data provided.',
            cause: error,
          });

        // Add more specific P-code mappings here as needed...

        // Default for other *known* DB errors
        default:
          return new HTTPException({
            status: 500, // Internal Server Error
            code: HTTPExceptionCode.INTERNAL_SERVER_ERROR,
            message: 'A known database error occurred.',
            cause: error,
          });
      }
    }

    // 3. Handle Prisma validation errors (e.g., wrong field type)
    if (error instanceof Prisma.PrismaClientValidationError) {
      return new HTTPException({
        status: 400, // Bad Request
        code: HTTPExceptionCode.BAD_REQUEST,
        message: 'Invalid request data or arguments.',
        cause: error,
      });
    }

    // 4. Handle Prisma initialization/connection errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return new HTTPException({
        status: 503, // Service Unavailable
        code: HTTPExceptionCode.SERVICE_UNAVAILABLE,
        message: 'Could not connect to the database.',
        cause: error,
      });
    }

    // 5. Handle unknown Prisma errors
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return new HTTPException({
        status: 500, // Internal Server Error
        code: HTTPExceptionCode.INTERNAL_SERVER_ERROR,
        message: 'An unknown database error occurred.',
        cause: error,
      });
    }

    // 6. Handle Prisma engine panics
    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return new HTTPException({
        status: 500, // Internal Server Error
        code: HTTPExceptionCode.INTERNAL_SERVER_ERROR,
        message: 'A fatal database engine error occurred.',
        cause: error,
      });
    }

    return null;
  }
}
