import { TransformFnParams, TransformationType } from 'class-transformer';

/**
 * Transforms a BufferSource (e.g., Buffer, Uint8Array, ArrayBuffer) to a hex string and back.
 * The deserialization from plain to class will always result in a Buffer instance.
 *
 * It also supports deserializing from the object-like structure
 * that results from `JSON.stringify(new Uint8Array([...]))`.
 *
 * @param params The transformation parameters.
 * @returns A hex string (for class to plain), a Buffer (for plain to class),
 * or the original value if it's null/undefined or the type is unknown.
 */
export const transformBufferSource = (
  params: TransformFnParams,
): BufferSource | string | any => {
  // Return null or undefined values as is
  if (params.value === null || params.value === undefined) {
    return params.value;
  }

  switch (params.type) {
    // CLASS_TO_PLAIN: Convert BufferSource -> hex string
    case TransformationType.CLASS_TO_PLAIN:
      if (Buffer.isBuffer(params.value)) {
        return params.value.toString('hex');
      }

      if (params.value instanceof Uint8Array) {
        return Buffer.from(params.value).toString('hex');
      }

      if (params.value instanceof ArrayBuffer) {
        return Buffer.from(new Uint8Array(params.value)).toString('hex');
      }

      throw new TypeError('Unsupported BufferSource type');

    // PLAIN_TO_CLASS: Convert hex string OR object -> Buffer
    case TransformationType.PLAIN_TO_CLASS:
      const { value } = params;

      // Handle hex string input
      if (typeof value === 'string') {
        // The result of Buffer.from is a Buffer, which is a Uint8Array
        // and thus satisfies the BufferSource type.
        return Buffer.from(value, 'hex');
      }

      // Handle object input from JSON.stringify({ '0': 79, '1': 252, ... })
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
      ) {
        // Object.values() extracts the byte numbers in the correct order.
        // Buffer.from() creates a Buffer from the array of numbers.
        return Buffer.from(Object.values(value));
      }

      // Return value as is if it's not a recognized format
      return value;

    // For any other transformation type, return the value as is
    default:
      return params.value;
  }
};
