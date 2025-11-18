import {
  ExceptionFilter as NestjsExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import {
  HTTPException,
  InternalServerError,
  RequestValidationFailed,
} from '@repo/exception';
import { Logger } from '@repo/logger';
import { isAnyPrismaError } from '@repo/prisma';
import { PrismaErrorMapper } from '@repo/prisma/mappers';
import { TsRestRequestValidationError } from '@ts-rest/nest';
import type { Response as ExpressResponse } from 'express';

const LOG_PREFIX = 'ExceptionFilter';
const log = new Logger({
  prefix: LOG_PREFIX,
});

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
    } else if (exception instanceof TsRestRequestValidationError) {
      webResponse = new RequestValidationFailed(exception).toResponse();
    } else {
      if (exception instanceof Error) {
        log.exception(exception);
      }

      webResponse = new InternalServerError().toResponse();
    }

    const status = webResponse.status;
    const body = await webResponse.json();

    response.status(status).json(body);
  }
}
