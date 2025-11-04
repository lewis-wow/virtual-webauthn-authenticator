import type { HTTPExceptionCode } from '@repo/enums';

export type HTTPExceptionOptions = {
  status: number;
  code: HTTPExceptionCode;
  message?: string;
  cause?: unknown;
};

export class HTTPException extends Error {
  status!: number;
  code!: HTTPExceptionCode;
  message!: string;
  cause?: unknown;

  constructor(opts: HTTPExceptionOptions) {
    const message = opts.message ?? opts.code.toLowerCase();

    super(message);

    Object.assign(this, {
      ...opts,
      message,
    });

    Object.setPrototypeOf(this, HTTPException.prototype);
  }

  toResponse(): Response {
    return Response.json(
      {
        code: this.code,
        message: this.message,
        cause: this.cause,
      },
      { status: this.status },
    );
  }
}
