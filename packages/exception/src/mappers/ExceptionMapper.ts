import type { Exception } from '../Exception';

export type ExceptionBody = {
  message: string;
  code: string;
  name: string;
};

export class ExceptionMapper {
  static exceptionToResponseBody(exception: Exception): ExceptionBody {
    return {
      message: exception.message,
      code: exception.code,
      name: exception.name,
    };
  }

  static exceptionToStatus(exception: Exception): number {
    return exception.status ?? 500;
  }

  static exceptionToResponse(exception: Exception): Response {
    return Response.json(ExceptionMapper.exceptionToResponseBody(exception), {
      status: ExceptionMapper.exceptionToStatus(exception),
    });
  }
}
