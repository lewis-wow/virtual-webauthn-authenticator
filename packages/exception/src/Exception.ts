export type ExceptionOptions = {
  status?: number;
  code: string;
  message: string;
  cause?: unknown;
};

export class Exception extends Error {
  status?: number;
  code!: string;
  message!: string;
  cause?: unknown;

  constructor(opts: ExceptionOptions) {
    super(opts.message);

    Object.assign(this, {
      ...opts,
    });

    Object.setPrototypeOf(this, Exception.prototype);
  }
}
