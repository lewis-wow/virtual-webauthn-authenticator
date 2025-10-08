import { type TransformFnParams, TransformationType } from 'class-transformer';

export const bufferTransformer =
  (encoding: BufferEncoding = 'base64') =>
  (params: TransformFnParams): string | Buffer | null => {
    const { value, type } = params;

    // --- Handle null/undefined ---
    // If the value is null or undefined, return it as is.
    // This prevents errors in the subsequent checks.
    if (value === null || value === undefined) {
      return value;
    }

    // --- Serialization (classToPlain) ---
    if (type === TransformationType.CLASS_TO_PLAIN) {
      if (value instanceof Buffer) {
        // Optional: you could decide to serialize an empty buffer as null
        // if (value.length === 0) {
        //   return null;
        // }
        return value.toString(encoding);
      }
      // If it's not a buffer (e.g., already a string), return it
      return value;
    }

    // --- Deserialization (plainToClass) ---
    if (type === TransformationType.PLAIN_TO_CLASS) {
      if (typeof value === 'string') {
        return Buffer.from(value, encoding);
      }
      // If it's not a string (e.g., already a buffer), return it
      return value;
    }

    return value;
  };
