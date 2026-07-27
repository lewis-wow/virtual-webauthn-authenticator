import type { AnyException } from '../Exception';
import { exceptionToJSON } from './exceptionToJSON';

export function exceptionToResponse(exception: AnyException): Response {
  return Response.json(exceptionToJSON(exception), {
    status: exception.status ?? 500,
  });
}
