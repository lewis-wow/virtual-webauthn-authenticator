export type KnownExceptionOptions = {
  message?: string;
};

export class KnownException extends Error {
  constructor({ message }: KnownExceptionOptions) {
    super(message);
    Object.setPrototypeOf(this, KnownException.prototype);
  }
}
