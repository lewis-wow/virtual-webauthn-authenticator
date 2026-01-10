import {
  ExceptionShapeSchema,
  type ExceptionShape,
} from './validation/ExceptionShapeSchema';

export class Exception<TData = undefined>
  extends Error
  implements ExceptionShape
{
  static readonly message: string = 'An unexpected error occurred.';
  static readonly status?: number;
  static readonly code: string;

  public readonly status?: number;
  public readonly code: string;
  public readonly data: TData;

  constructor(opts?: Partial<ExceptionShape>) {
    // Access static properties from the class being instantiated
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

  static fromResponse(opts: {
    json: unknown;
    status: number;
  }): Exception | null {
    const { json, status } = opts;

    const parseResult = ExceptionShapeSchema.safeParse(json);

    if (!parseResult.success) {
      return null;
    }

    return new Exception({ ...parseResult.data, status });
  }

  toJSON(opts?: { omitData?: boolean }) {
    return {
      message: this.message,
      code: this.code,
      data: opts?.omitData === true ? undefined : this.data,
    };
  }

  toResponse(): Response {
    return Response.json(this.toJSON(), { status: this.status ?? 500 });
  }
}
