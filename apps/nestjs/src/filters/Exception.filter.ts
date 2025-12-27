import {
  ExceptionFilter as NestjsExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Exception, RequestValidationFailed } from '@repo/exception';
import { InternalServerError } from '@repo/exception/http';
import { ExceptionMapper } from '@repo/exception/mappers';
import { TsRestRequestValidationError } from '@ts-rest/nest';
import type { Response as ExpressResponse } from 'express';

@Catch()
export class ExceptionFilter implements NestjsExceptionFilter {
  async catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();

    let exception: Exception;

    if (error instanceof Exception) {
      exception = error;
    } else if (error instanceof TsRestRequestValidationError) {
      exception = new RequestValidationFailed({
        cause: error,
      });
    } else {
      exception = new InternalServerError();
    }

    const webResponse = ExceptionMapper.exceptionToResponse(exception);

    const status = webResponse.status;
    const body = await webResponse.json();

    response.status(status).json(body);
  }
}
