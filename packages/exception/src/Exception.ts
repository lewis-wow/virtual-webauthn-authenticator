export type ExceptionOptions = {
  status?: number;
  code?: string;
  message?: string;
  cause?: unknown;
};

export class Exception extends Error {
  status?: number;
  code!: string;
  message!: string;
  cause?: unknown;

  constructor(opts?: ExceptionOptions) {
    super(opts?.message);

    const status =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      opts?.status ?? ((this as any).contructor.status as number | undefined);

    const message =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      opts?.message ?? ((this as any).contructor.message as string | undefined);

    const code =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      opts?.code ?? ((this as any).contructor.code as string | undefined);

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
