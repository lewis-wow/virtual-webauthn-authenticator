export type ExceptionOptions = {
  status?: number;
  code?: string;
  message?: string;
  cause?: unknown;
};

export class Exception extends Error {
  static status?: number;
  static code?: string;
  static message?: string;
  static cause?: unknown;

  status?: number;
  code!: string;
  message!: string;
  cause?: unknown;

  constructor(opts?: ExceptionOptions) {
    super(opts?.message);

    const status =
      opts?.status ??
      ((this.constructor as typeof Exception)?.status as number | undefined);

    const message =
      opts?.message ??
      ((this.constructor as typeof Exception)?.message as string | undefined);

    const code =
      opts?.code ??
      ((this.constructor as typeof Exception)?.code as string | undefined);

    Object.assign(this, {
      message,
      code,
      status,
      cause: opts?.cause ?? this.cause,
    });

    if (this.code === undefined || this.message === undefined) {
      throw new TypeError('Invalid exception.', {
        cause: {
          code: this.code,
          message: this.message,
        },
      });
    }

    Object.setPrototypeOf(this, Exception.prototype);
  }

  static isException(error: unknown): error is Exception {
    return error instanceof Exception;
  }
}
