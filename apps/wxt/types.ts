import { AnyExceptionShape } from '@repo/exception/validation';

export type SuccessResponse<T> = {
  ok: true;
  data: T;
};

export type ErrorResponse = {
  ok: false;
  error: AnyExceptionShape;
};

export type Response<T> = SuccessResponse<T> | ErrorResponse;
