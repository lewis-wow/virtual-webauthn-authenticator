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

    Object.assign(this, {
      ...opts,
    });

    if (this.code === undefined || this.message === undefined) {
      throw new TypeError('Invalid exception.');
    }

    Object.setPrototypeOf(this, Exception.prototype);
  }

  static isException(error: unknown): error is Exception {
    return error instanceof Exception;
  }
}
