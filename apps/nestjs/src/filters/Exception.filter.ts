import {
  ExceptionFilter as NestjsExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { HTTPException, InternalServerError } from '@repo/exception';
import { PrismaErrorMapper } from '@repo/mappers';
import { isAnyPrismaError } from '@repo/prisma';
import { Response as ExpressResponse } from 'express';

@Catch()
export class ExceptionFilter implements NestjsExceptionFilter {
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();
    let webResponse: Response;

    if (exception instanceof HTTPException) {
      webResponse = exception.toResponse();
    } else if (isAnyPrismaError(exception)) {
      webResponse = (
        PrismaErrorMapper.toHTTPException(exception) ??
        new InternalServerError()
      ).toResponse();
    } else {
      webResponse = new InternalServerError().toResponse();
    }

    const status = webResponse.status;
    const body = await webResponse.json();

    response.status(status).json(body);
  }
}
