import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';
import type z from 'zod';

export type TypeAssertionErrorData = z.ZodError | undefined;

export class TypeAssertionError extends Exception<TypeAssertionErrorData> {
  static status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'TypeAssertionError';
  static message = 'Type mismatch';

  static readonly SHOULD_INCLUDE_DATA = false;

  constructor(dataPayload?: TypeAssertionErrorData) {
    const data = TypeAssertionError.SHOULD_INCLUDE_DATA
      ? dataPayload
      : undefined;

    super({ data });
  }
}
