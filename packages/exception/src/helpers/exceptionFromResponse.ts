import { ExceptionShapeSchema } from '../validation/ExceptionShapeSchema';
import { Exception } from '../Exception';

export function exceptionFromResponse(opts: {
  json: unknown;
  status: number;
}): Exception | null {
  const { json, status } = opts;

  const parseResult = ExceptionShapeSchema.safeParse(json);

  if (!parseResult.success) {
    return null;
  }

  return new Exception({ ...parseResult.data, status });
}
