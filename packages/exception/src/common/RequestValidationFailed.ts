import { HTTPExceptionCode } from '@repo/enums';
import type { StandardSchemaV1 } from '@standard-schema/spec';

import { HTTPException } from '../HTTPException';

export class RequestValidationFailed extends HTTPException {
  constructor(cause: {
    pathParams: StandardSchemaV1.FailureResult | null;
    headers: StandardSchemaV1.FailureResult | null;
    query: StandardSchemaV1.FailureResult | null;
    body: StandardSchemaV1.FailureResult | null;
  }) {
    super({
      status: 400,
      code: HTTPExceptionCode.REQUEST_VALIDATION_FAILED,
      message: 'Request validation failed.',
      cause: {
        pathParams: cause.pathParams,
        Headers: cause.headers,
        query: cause.query,
        body: cause.body,
      },
    });
  }
}
