import type { Exception } from '../Exception';

export class ExceptionMapper {
  static exceptionToResponse(exception: Exception): Response {
    return Response.json(
      {
        message: exception.message,
        code: exception.code,
        name: exception.name,
      },
      {
        status: exception.status ?? 500,
      },
    );
  }
}
