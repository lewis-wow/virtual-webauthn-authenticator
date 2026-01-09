export type InteractionOptions = {
  message: string;
  timeout?: number;
};

export abstract class Interaction extends Error {
  static readonly code: string;
  public readonly timeout?: number;

  constructor(opts: InteractionOptions) {
    super(opts.message);
    this.timeout = opts.timeout;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
