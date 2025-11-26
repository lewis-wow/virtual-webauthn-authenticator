export type ErrorJSON = {
  name: string;
  message: string;
  stack?: string;
  cause?: ErrorJSON | null;
  [key: string]: unknown;
};

export class ErrorMapper {
  static errorToErrorJSON(value: unknown): ErrorJSON | null {
    if (value === undefined || value === null) {
      return null;
    }

    // Handle non-Error values
    if (!(value instanceof Error)) {
      // If it's a plain object, spread its properties
      if (typeof value === 'object' && value !== null) {
        return {
          message: 'Value is a non-Error object',
          name: 'NonErrorObject',
          ...value,
        };
      }
      // Handle primitives (string, number, etc.)
      return {
        message: String(value),
        name: 'NonErrorValue',
      };
    }

    // It's an Error object
    const error: Error = value;

    // Start with the standard, often non-enumerable properties
    const plainObject: ErrorJSON = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    // Copy all enumerable properties (like custom 'code' properties)
    // This will overwrite 'name' or 'message' if they were made enumerable
    Object.assign(plainObject, error);

    // Handle the 'cause' property recursively (ES2022)
    // 'cause' is often present on Error but might be undefined
    if ('cause' in error && error.cause !== undefined) {
      plainObject.cause = ErrorMapper.errorToErrorJSON(error.cause);
    }

    return plainObject;
  }
}
