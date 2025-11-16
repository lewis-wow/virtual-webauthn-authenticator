export type ExceptionOptions = {
  code: string;
  message: string;
  cause?: unknown;
};

export class Exception extends Error {
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
