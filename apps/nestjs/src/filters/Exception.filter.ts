import {
  ExceptionFilter as NestjsExceptionFilter,
  Catch,
  ArgumentsHost,
  Injectable,
} from '@nestjs/common';
import { Exception, RequestValidationFailed } from '@repo/exception';
import { InternalServerError } from '@repo/exception/http';
import { ExceptionMapper } from '@repo/exception/mappers';
import { Logger } from '@repo/logger';
import { TsRestRequestValidationError } from '@ts-rest/nest';
import type { Response as ExpressResponse } from 'express';

@Catch()
@Injectable()
export class ExceptionFilter implements NestjsExceptionFilter {
  constructor(private readonly logger: Logger) {}

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

      if (error instanceof Error) {
        this.logger.exception(error);
      }
    }

    const webResponse = ExceptionMapper.exceptionToResponse(exception);

    const status = webResponse.status;
    const body = await webResponse.json();

    response.status(status).json(body);
  }
}
