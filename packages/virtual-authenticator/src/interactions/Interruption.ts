export type InterruptionOptions = {
  message: string;
  timeout?: number;
};

export abstract class Interruption extends Error {
  static readonly code: string;
  public readonly timeout?: number;

  constructor(opts: InterruptionOptions) {
    super(opts.message);
    this.timeout = opts.timeout;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
