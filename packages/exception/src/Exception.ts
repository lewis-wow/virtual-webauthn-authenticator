import {
  ExceptionShapeSchema,
  type ExceptionShape,
} from './validation/ExceptionShapeSchema';

export type ExceptionOptions = Omit<ExceptionShape, 'name'>;

export class Exception extends Error implements ExceptionShape {
  static readonly message: string = 'An unexpected error occurred.';
  static readonly status?: number;
  static readonly code: string;

  public readonly status?: number;
  public readonly code: string;

  constructor(opts?: ExceptionOptions) {
    // Access static properties from the class being instantiated
    const ctor = new.target as typeof Exception;

    const status = opts?.status ?? ctor.status;
    const message = opts?.message ?? ctor.message;

    // Pass message and cause to the parent Error class
    super(message, { cause: opts?.cause });
    Object.setPrototypeOf(this, new.target.prototype);

    this.code = ctor.code;
    this.status = status;
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

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }

  toResponse(): Response {
    return Response.json(this.toJSON(), { status: this.status ?? 500 });
  }
}
