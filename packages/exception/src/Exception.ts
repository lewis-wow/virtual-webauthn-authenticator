// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExceptionMessage<T = any> = string | ((data: T) => string);

export type ExceptionOptions<T> = {
  status?: number;
  code?: string;
  message?: ExceptionMessage<T>;
  cause?: unknown;
} & (T extends undefined ? { data?: T } : { data: T });

export class Exception<T = undefined> extends Error {
  static status?: number;
  static code?: string;
  static message?: ExceptionMessage;
  static cause?: unknown;

  status?: number;
  code!: string;
  message!: string;
  cause?: unknown;

  constructor(opts?: ExceptionOptions<T>) {
    super();

    const status =
      opts?.status ?? (this.constructor as typeof Exception)?.status;

    const messageFactory =
      opts?.message ?? (this.constructor as typeof Exception)?.message;
    const message =
      typeof messageFactory === 'function'
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messageFactory(opts?.data as any)
        : messageFactory;

    const code = opts?.code ?? (this.constructor as typeof Exception)?.code;

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
