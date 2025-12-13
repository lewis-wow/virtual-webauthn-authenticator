export class TypeAssertionError extends Error {
  constructor() {
    const message = 'Type mismatch';

    super(message);
    Object.setPrototypeOf(this, TypeAssertionError.prototype);
  }
}
