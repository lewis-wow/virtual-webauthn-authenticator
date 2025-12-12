// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExceptionMessage<T = any> = string | ((data: T) => string);

export type ExceptionOptions<T = undefined> = {
  status?: number;
  code?: string;
  message?: ExceptionMessage<T>;
  cause?: unknown;
} & (T extends undefined ? { data?: undefined } : { data: T });

export class Exception<T = undefined> extends Error {
  static readonly status: number = 500;
  static readonly code: string = 'INTERNAL_SERVER_ERROR';
  static readonly message: ExceptionMessage = 'An unexpected error occurred.';

  public readonly status: number;
  public readonly code: string;

  constructor(opts?: ExceptionOptions<T>) {
    // Access static properties from the class being instantiated
    const ctor = new.target as typeof Exception;

    const status = opts?.status ?? ctor.status;
    const code = opts?.code ?? ctor.code;
    const data = opts && 'data' in opts ? opts.data : undefined;

    const messageFactory = opts?.message ?? ctor.message;
    const message =
      typeof messageFactory === 'function'
        ? messageFactory(data as T)
        : messageFactory;

    // Pass message and cause to the parent Error class
    super(message, { cause: opts?.cause });

    this.name = ctor.name;
    this.status = status;
    this.code = code;

    if (!this.code) {
      throw new Error(`Exception ${this.name} requires a 'code'.`);
    }
  }
}
