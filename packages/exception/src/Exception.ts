import { type AnyExceptionShape } from './validation/ExceptionShapeSchema';

export class Exception<TData = undefined>
  extends Error
  implements AnyExceptionShape
{
  static readonly message: string = 'An unexpected error occurred.';
  static readonly status?: number;
  static readonly code: string;

  public readonly status?: number;
  public readonly code: string;
  public readonly data: TData;

  constructor(opts?: Partial<AnyExceptionShape>) {
    const ctor = new.target as typeof Exception;

    const status = opts?.status ?? ctor.status;
    const message = opts?.message ?? ctor.message;
    const code = opts?.code ?? ctor.code;
    const cause = opts?.cause;
    const data = opts?.data as TData;

    super(message, { cause });
    Object.setPrototypeOf(this, new.target.prototype);

    this.code = code;
    this.status = status;
    this.data = data;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyException = Exception<any>;
