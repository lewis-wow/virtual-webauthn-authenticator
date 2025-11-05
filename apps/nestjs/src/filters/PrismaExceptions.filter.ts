import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { InternalServerError } from '@repo/exception';
import { PrismaErrorMapper } from '@repo/mappers';
import { Response as ExpressResponse } from 'express';

/**
 * Catches all exceptions that are NOT explicitly an instance of
 * our custom `HTTPException`.
 *
 * This filter is a "catch-all" for:
 * - Prisma Errors
 * - Standard JavaScript Errors (`Error`)
 * - Default NestJS `HttpException`s
 * - Any other unhandled exception
 *
 * It uses the `PrismaErrorMapper` to transform the error into our
 * standardized `HTTPException` format before sending the response.
 *
 * @see HTTPExceptionFilter (handles a thrown `HTTPException`)
 */
@Catch()
export class PrismaExceptionsFilter implements ExceptionFilter {
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();

    // Use the mapper to convert *any* error into our standard HTTPException
    // The mapper is smart enough to handle Prisma errors, standard errors,
    // and even pass-through HTTPExceptions if one snuck through.
    const httpException =
      PrismaErrorMapper.toHTTPException(exception) ?? new InternalServerError();

    // Use the standardized exception's method to get a Response
    const webResponse = httpException.toResponse();

    const status = webResponse.status;
    const body = await webResponse.json();

    // Send the standardized JSON response
    response.status(status).json(body);
  }
}
