import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HTTPException } from '@repo/exception';
import { Response as ExpressResponse } from 'express';

@Catch(HTTPException)
export class HTTPExceptionFilter implements ExceptionFilter {
  async catch(exception: HTTPException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();

    const webResponse = exception.toResponse();

    const status = webResponse.status;
    const body = await webResponse.json();

    response.status(status).json(body);
  }
}
